import crypto from "crypto";

import mongoose from "mongoose";

import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import razorpay from "../config/razorpay.js";
import WebhookEvent from "../models/webhook-event.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const initiatePayment = async (orderId, userId) => {
  // Validate order
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.paymentMethod !== "Online") {
    throw createError("This order is not an online payment order");
  }

  if (order.orderStatus === "Cancelled") {
    throw createError("Cancelled orders cannot be paid");
  }

  if (order.paymentStatus === "Paid") {
    throw createError("Order is already paid");
  }

  if (order.paymentStatus === "Refunded") {
    throw createError("Refunded orders cannot be paid again");
  }

  if (!Number.isFinite(order.totalAmount) || order.totalAmount <= 0) {
    throw createError("Invalid order amount");
  }

  // Reuse existing payment
  const existingPayment = await Payment.findOne({
    order: order._id,
    user: userId,
    status: "Created",
  });

  if (existingPayment) {
    return existingPayment;
  }

  // Create Razorpay order outside MongoDB transaction
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: `order_${order.orderNumber}`,
    notes: {
      orderId: order._id.toString(),
      userId: userId.toString(),
    },
  });

  try {
    const payment = await Payment.create({
      order: order._id,
      user: userId,
      provider: "Razorpay",
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      status: "Created",
    });

    return payment;
  } catch (error) {
    // Handle concurrent payment creation
    if (error.code === 11000) {
      const latestPayment = await Payment.findOne({
        order: order._id,
        user: userId,
        status: "Created",
      });

      if (latestPayment) {
        return latestPayment;
      }
    }

    throw error;
  }
};

export const verifyPayment = async (userId, paymentData) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    paymentData;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw createError("Payment verification details are required", 400);
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw createError("Razorpay key secret is not configured", 500);
  }

  if (!/^[a-f0-9]+$/i.test(razorpay_signature)) {
    throw createError("Invalid payment signature", 400);
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    user: userId,
  });

  if (!payment) {
    throw createError("Payment record not found", 404);
  }

  // Already paid
  if (payment.status === "Paid") {
    if (payment.razorpayPaymentId !== razorpay_payment_id) {
      throw createError("Payment ID mismatch", 400);
    }

    return payment;
  }

  // Prevent verification of refunded payments
  if (["RefundPending", "Refunded"].includes(payment.status)) {
    throw createError("Payment cannot be verified in its current status");
  }

  if (payment.status !== "Created") {
    throw createError("Payment is not available for verification");
  }

  // Verify Razorpay signature
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const signatureBuffer = Buffer.from(generatedSignature, "hex");
  const receivedSignatureBuffer = Buffer.from(razorpay_signature, "hex");

  if (
    signatureBuffer.length !== receivedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, receivedSignatureBuffer)
  ) {
    throw createError("Invalid payment signature", 400);
  }

  // Verify payment directly with Razorpay
  const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

  if (razorpayPayment.order_id !== razorpay_order_id) {
    throw createError("Payment order mismatch", 400);
  }

  if (
    razorpayPayment.amount !== Math.round(payment.amount * 100) ||
    razorpayPayment.currency !== payment.currency
  ) {
    throw createError("Payment amount or currency mismatch", 400);
  }

  if (razorpayPayment.status !== "captured") {
    throw createError("Payment is not captured yet", 400);
  }

  const session = await mongoose.startSession();

  try {
    let updatedPayment;

    await session.withTransaction(async () => {
      const currentPayment = await Payment.findById(payment._id).session(
        session,
      );

      if (!currentPayment) {
        throw createError("Payment record not found", 404);
      }

      // Handle concurrent verification or webhook update
      if (currentPayment.status === "Paid") {
        if (currentPayment.razorpayPaymentId !== razorpay_payment_id) {
          throw createError("Payment ID mismatch", 400);
        }

        updatedPayment = currentPayment;
        return;
      }

      if (["RefundPending", "Refunded"].includes(currentPayment.status)) {
        throw createError("Payment cannot be verified in its current status");
      }

      if (currentPayment.status !== "Created") {
        throw createError("Payment is not available for verification");
      }

      const order = await Order.findById(currentPayment.order).session(session);

      if (!order || order.user.toString() !== userId.toString()) {
        throw createError("Order not found", 404);
      }

      if (order.orderStatus === "Cancelled") {
        throw createError("Order is already cancelled");
      }

      if (order.paymentStatus === "Refunded") {
        throw createError("Order payment is already refunded");
      }

      currentPayment.razorpayPaymentId = razorpay_payment_id;
      currentPayment.signature = razorpay_signature;
      currentPayment.paymentMethod = razorpayPayment.method;
      currentPayment.status = "Paid";
      currentPayment.verifiedAt = new Date();

      await currentPayment.save({ session });

      order.paymentStatus = "Paid";
      await order.save({ session });

      updatedPayment = currentPayment;
    });

    return updatedPayment;
  } finally {
    await session.endSession();
  }
};

export const handleRazorpayWebhook = async (rawBody, signature, eventId) => {
  if (!Buffer.isBuffer(rawBody)) {
    throw createError("Invalid webhook payload", 400);
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw createError("Webhook secret is not configured", 500);
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (!signature || !/^[a-f0-9]+$/i.test(signature)) {
    throw createError("Invalid webhook signature", 400);
  }

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw createError("Webhook signature verification failed", 400);
  }

  const event = JSON.parse(rawBody.toString("utf8"));

  if (!eventId || typeof eventId !== "string") {
    throw createError("Missing Razorpay event ID", 400);
  }

  if (!event.event) {
    throw createError("Invalid webhook event", 400);
  }

  // Register webhook event and prevent duplicates
  let webhookRecord;

  try {
    webhookRecord = await WebhookEvent.create({
      eventId,
      event: event.event,
      status: "Processing",
    });
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    const existingEvent = await WebhookEvent.findOne({ eventId });

    if (existingEvent?.status === "Processed") {
      return {
        received: true,
        processed: false,
        duplicate: true,
      };
    }

    // Allow recovery after 5 minutes.
    const staleBefore = new Date(Date.now() - 5 * 60 * 1000);

    webhookRecord = await WebhookEvent.findOneAndUpdate(
      {
        eventId,
        $or: [
          { status: "Failed" },
          {
            status: "Processing",
            processingStartedAt: { $lte: staleBefore },
          },
          {
            status: "Processing",
            processingStartedAt: { $exists: false },
          },
          {
            status: "Processing",
            processingStartedAt: null,
          },
        ],
      },
      {
        $set: {
          status: "Processing",
          processingStartedAt: new Date(),
          processedAt: null,
        },
      },
      { new: true },
    );

    if (!webhookRecord) {
      throw createError("Webhook event is already processing", 503);
    }
  }

  try {
    // Handle Refund Webhooks
    if (["refund.processed", "refund.failed"].includes(event.event)) {
      const refund = event.payload?.refund?.entity;

      if (!refund?.payment_id || !refund?.id) {
        throw createError("Invalid refund webhook data", 400);
      }

      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const payment = await Payment.findOne({
            razorpayPaymentId: refund.payment_id,
          }).session(session);

          if (!payment) {
            throw createError("Payment not found", 404);
          }

          const order = await Order.findById(payment.order).session(session);

          if (!order) {
            throw createError("Order not found", 404);
          }

          if (event.event === "refund.processed") {
            if (refund.amount !== Math.round(payment.amount * 100)) {
              throw createError("Refund amount mismatch", 400);
            }

            payment.status = "Refunded";
            payment.refundId = refund.id;
            payment.refundedAt = new Date();

            order.paymentStatus = "Refunded";
          }

          if (event.event === "refund.failed") {
            // Never downgrade an already refunded payment.
            if (payment.status === "Refunded") {
              return;
            }

            // Ignore unrelated or outdated refund events.
            if (payment.refundId && payment.refundId !== refund.id) {
              return;
            }

            // Update only an active refund request.
            if (payment.status === "RefundPending") {
              payment.status = "Paid";
              payment.refundId = null;
              payment.refundIdempotencyKey = null;
              payment.failureReason = "Razorpay refund failed";

              order.paymentStatus = "Paid";
            }
          }

          await payment.save({ session });
          await order.save({ session });
        });
      } finally {
        await session.endSession();
      }

      await WebhookEvent.findByIdAndUpdate(webhookRecord._id, {
        $set: {
          status: "Processed",
          processedAt: new Date(),
        },
      });

      return {
        received: true,
        processed: true,
      };
    }

    // Ignore unsupported events safely
    if (!["payment.captured", "payment.failed"].includes(event.event)) {
      await WebhookEvent.findByIdAndUpdate(webhookRecord._id, {
        $set: {
          status: "Processed",
          processedAt: new Date(),
        },
      });

      return {
        received: true,
        processed: false,
      };
    }

    const razorpayPayment = event.payload?.payment?.entity;

    if (!razorpayPayment?.order_id || !razorpayPayment?.id) {
      throw createError("Invalid payment webhook data", 400);
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const payment = await Payment.findOne({
          razorpayOrderId: razorpayPayment.order_id,
        }).session(session);

        if (!payment) {
          throw createError("Payment record not found", 404);
        }

        const order = await Order.findById(payment.order).session(session);

        if (!order) {
          throw createError("Order not found", 404);
        }

        if (event.event === "payment.captured") {
          if (
            razorpayPayment.amount !== Math.round(payment.amount * 100) ||
            razorpayPayment.currency !== payment.currency
          ) {
            throw createError("Payment amount or currency mismatch", 400);
          }

          // Never change a refund-related payment status.
          if (["RefundPending", "Refunded"].includes(payment.status)) {
            return;
          }

          if (payment.status === "Failed") {
            throw createError("Failed payment cannot be marked as paid", 409);
          }

          // Store captured payment even if the order was cancelled.
          if (order.orderStatus === "Cancelled") {
            payment.razorpayPaymentId = razorpayPayment.id;
            payment.paymentMethod = razorpayPayment.method;
            payment.status = "Paid";
            payment.verifiedAt = new Date();

            await payment.save({ session });
            return;
          }

          if (payment.status !== "Paid") {
            payment.razorpayPaymentId = razorpayPayment.id;
            payment.paymentMethod = razorpayPayment.method;
            payment.status = "Paid";
            payment.verifiedAt = new Date();

            await payment.save({ session });
          }

          if (order.paymentStatus !== "Paid") {
            order.paymentStatus = "Paid";
            await order.save({ session });
          }
        }

        if (
          event.event === "payment.failed" &&
          payment.status !== "Paid" &&
          payment.status !== "Refunded" &&
          order.paymentStatus !== "Paid" &&
          order.paymentStatus !== "Refunded"
        ) {
          payment.status = "Failed";
          payment.razorpayPaymentId = razorpayPayment.id;
          payment.failureReason =
            razorpayPayment.error_description || "Payment failed";

          await payment.save({ session });

          order.paymentStatus = "Failed";
          await order.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }

    // Automatically refund captured payments for cancelled orders.
    if (event.event === "payment.captured") {
      const payment = await Payment.findOne({
        razorpayOrderId: razorpayPayment.order_id,
      });

      if (payment) {
        const order = await Order.findById(payment.order);

        if (order?.orderStatus === "Cancelled") {
          await refundPayment(
            payment._id,
            "Automatic refund for cancelled order",
          );
        }
      }
    }

    await WebhookEvent.findByIdAndUpdate(webhookRecord._id, {
      $set: {
        status: "Processed",
        processedAt: new Date(),
      },
    });

    return {
      received: true,
      processed: true,
    };
  } catch (error) {
    await WebhookEvent.findByIdAndUpdate(webhookRecord._id, {
      $set: {
        status: "Failed",
      },
    });

    throw error;
  }
};

export const refundPayment = async (paymentId, reason = "Customer refund") => {
  let payment = await Payment.findById(paymentId);

  if (!payment) {
    throw createError("Payment not found", 404);
  }

  if (payment.status === "Refunded") {
    return payment;
  }

  if (!["Paid", "RefundPending"].includes(payment.status)) {
    throw createError("Only paid payments can be refunded");
  }

  if (!payment.razorpayPaymentId) {
    throw createError("Razorpay payment ID not found");
  }

  const order = await Order.findById(payment.order);

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.orderStatus !== "Cancelled") {
    throw createError("Cancel the order before processing a refund");
  }

  // Atomically claim the refund operation.
  if (payment.status === "Paid") {
    const idempotencyKey = crypto.randomUUID();

    const claimedPayment = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: "Paid",
        refundIdempotencyKey: null,
      },
      {
        $set: {
          status: "RefundPending",
          refundIdempotencyKey: idempotencyKey,
          refundReason: reason,
        },
      },
      { new: true },
    );

    payment = claimedPayment || (await Payment.findById(paymentId));
  }

  if (!payment) {
    throw createError("Payment not found", 404);
  }

  if (payment.status === "Refunded") {
    return payment;
  }

  if (payment.status !== "RefundPending" || !payment.refundIdempotencyKey) {
    throw createError("Refund is not available for processing");
  }

  // Preserve the original reason for retry requests.
  if (!payment.refundReason) {
    payment =
      (await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          status: "RefundPending",
          refundIdempotencyKey: payment.refundIdempotencyKey,
          refundReason: null,
        },
        {
          $set: {
            refundReason: reason,
          },
        },
        { new: true },
      )) || (await Payment.findById(paymentId));
  }

  if (!payment) {
    throw createError("Payment not found", 404);
  }

  if (payment.status === "Refunded") {
    return payment;
  }

  if (payment.refundId) {
    return payment;
  }

  if (
    payment.status !== "RefundPending" ||
    !payment.refundIdempotencyKey ||
    !payment.refundReason
  ) {
    throw createError("Refund is not available for processing");
  }

  const idempotencyKey = payment.refundIdempotencyKey;

  const razorpayPayment = await razorpay.payments.fetch(
    payment.razorpayPaymentId,
  );


  // Use the same idempotency key and request body for retries.
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${payment.razorpayPaymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
        ).toString("base64")}`,
        "Content-Type": "application/json",
        "X-Refund-Idempotency": idempotencyKey,
      },
      body: JSON.stringify({
        amount: Math.round(payment.amount * 100),
        notes: {
          reason: payment.refundReason,
          orderId: order._id.toString(),
        },
      }),
    },
  );

  let refundData;

  try {
    refundData = await response.json();
  } catch {
    throw createError("Invalid response received from Razorpay", 502);
  }

  if (!response.ok) {
    console.error("Razorpay Refund Error:", {
      status: response.status,
      code: refundData.error?.code,
      description: refundData.error?.description,
      source: refundData.error?.source,
      step: refundData.error?.step,
      reason: refundData.error?.reason,
      metadata: refundData.error?.metadata,
    });

    throw createError(
      refundData.error?.description || "Refund request failed",
      response.status,
    );
  }

  if (!refundData.id || !refundData.status) {
    throw createError("Invalid refund response from Razorpay", 502);
  }

  const updateFields = {
    refundId: refundData.id,
  };

  if (refundData.status === "processed") {
    updateFields.status = "Refunded";
    updateFields.refundedAt = new Date();
  } else if (refundData.status === "failed") {
    updateFields.status = "Paid";
    updateFields.refundId = null;
    updateFields.refundIdempotencyKey = null;
    updateFields.failureReason = "Razorpay refund failed";
  }

  // Update only if the webhook has not already changed the status.
  const updatedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: "RefundPending",
      refundIdempotencyKey: idempotencyKey,
    },
    {
      $set: updateFields,
    },
    { new: true },
  );

  const latestPayment = updatedPayment || (await Payment.findById(paymentId));

  if (!latestPayment) {
    throw createError("Payment not found", 404);
  }

  if (latestPayment.status === "Refunded") {
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentStatus: "Refunded",
        },
      },
    );
  } else if (latestPayment.status === "Paid") {
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentStatus: "Paid",
        },
      },
    );
  }

  return latestPayment;
};
