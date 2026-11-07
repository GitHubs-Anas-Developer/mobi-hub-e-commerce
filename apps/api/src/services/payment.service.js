import crypto from "crypto";

import mongoose from "mongoose";

import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import razorpay from "../config/razorpay.js";
import WebhookEvent from "../models/webhook-event.model.js";
import { createNotification } from "./notification.service.js";
import PaymentRefund from "../models/payment-refund.model.js";
import Return from "../models/return.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const fetchRazorpayRefund = async (refundId) => {
  const response = await fetch(
    `https://api.razorpay.com/v1/refunds/${refundId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
        ).toString("base64")}`,
      },
    },
  );

  const refundData = await response.json();

  if (!response.ok) {
    throw createError("Unable to verify current Razorpay refund status", 502);
  }

  if (
    !refundData.id ||
    !["pending", "processed", "failed"].includes(refundData.status)
  ) {
    throw createError("Invalid Razorpay refund response", 502);
  }

  return refundData;
};

const sendPaymentNotification = async ({ payment, type, title, message }) => {
  try {
    await createNotification({
      recipient: payment.user,
      title,
      message,
      type,
      relatedId: payment._id,
      relatedModel: "Payment",
    });
  } catch (error) {
    console.error("Payment notification error:", error.message);
  }
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

    await sendPaymentNotification({
      payment: updatedPayment,
      type: "PAYMENT_SUCCESS",
      title: "Payment Successful",
      message: "Your payment has been successfully completed.",
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

  // 1. Verify webhook signature
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

  // 2. Register webhook event and prevent duplicates
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
    let refundNotification = null;
    let paymentNotification = null;

    // 3. Handle refund webhooks
    if (["refund.processed", "refund.failed"].includes(event.event)) {
      const refundEntity = event.payload?.refund?.entity;

      if (!refundEntity?.id || !refundEntity.payment_id) {
        throw createError("Invalid refund webhook data", 400);
      }

      // Always verify the latest provider status.
      const providerRefund = await fetchRazorpayRefund(refundEntity.id);

      if (
        providerRefund.id !== refundEntity.id ||
        providerRefund.payment_id !== refundEntity.payment_id
      ) {
        throw createError("Razorpay refund verification mismatch", 409);
      }

      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          let refundRecord = await PaymentRefund.findOne({
            providerRefundId: providerRefund.id,
            provider: "Razorpay",
          }).session(session);

          // Fallback lookup using Razorpay refund notes.
          if (!refundRecord) {
            const returnId = providerRefund.notes?.returnId;
            const attempt = Number(providerRefund.notes?.attempt);

            if (returnId && Number.isInteger(attempt) && attempt > 0) {
              refundRecord = await PaymentRefund.findOne({
                referenceType: "Return",
                referenceId: returnId,
                attempt,
                provider: "Razorpay",
              }).session(session);
            }
          }

          // ------------------------------------
          // RETURN REFUND FLOW
          // ------------------------------------
          if (refundRecord) {
            if (!refundRecord.payment) {
              throw createError("Refund payment reference is missing", 409);
            }

            const payment = await Payment.findById(
              refundRecord.payment,
            ).session(session);

            if (
              !payment ||
              payment.razorpayPaymentId !== providerRefund.payment_id
            ) {
              throw createError("Refund payment mismatch", 409);
            }

            if (
              providerRefund.amount !== Math.round(refundRecord.amount * 100)
            ) {
              throw createError("Refund amount mismatch", 409);
            }

            const previousStatus = refundRecord.status;
            const wasAlreadyProcessed = previousStatus === "Processed";

            const reconciliationReasons = [];

            let returnRequest = null;
            let isCurrentReturnAttempt = true;

            if (refundRecord.referenceType === "Return") {
              returnRequest = await Return.findById(
                refundRecord.referenceId,
              ).session(session);

              if (
                returnRequest &&
                returnRequest.paymentRefund?.toString() !==
                  refundRecord._id.toString()
              ) {
                isCurrentReturnAttempt = false;
              }
            }

            // ------------------------------------
            // PROVIDER REFUND PENDING
            // ------------------------------------
            if (providerRefund.status === "pending") {
              // Never downgrade terminal refund states.
              if (
                previousStatus === "Processed" ||
                previousStatus === "Failed"
              ) {
                reconciliationReasons.push(
                  `Provider returned pending for a locally ${previousStatus} refund attempt ${refundRecord.attempt}.`,
                );
              } else {
                refundRecord.status = "Processing";
                refundRecord.providerStatus = "pending";
                refundRecord.providerStatusCheckedAt = new Date();
              }

              refundRecord.providerRefundId = providerRefund.id;

              await refundRecord.save({ session });

              if (reconciliationReasons.length > 0) {
                payment.refundReconciliationRequired = true;

                payment.refundReconciliationReason = [
                  payment.refundReconciliationReason,
                  ...reconciliationReasons,
                ]
                  .filter(Boolean)
                  .join(" | ");

                payment.refundReconciliationAt = new Date();

                await payment.save({ session });
              }

              return;
            }

            // ------------------------------------
            // PROVIDER REFUND FAILED
            // ------------------------------------
            if (providerRefund.status === "failed") {
              // A processed refund must never be downgraded.
              if (previousStatus === "Processed") {
                reconciliationReasons.push(
                  `Razorpay reported failed for an already processed refund attempt ${refundRecord.attempt}.`,
                );
              } else {
                // Keep reservation until processReturnRefund()
                // verifies failure before allowing a retry.
                refundRecord.status = "Failed";
                refundRecord.providerStatus = "failed";
                refundRecord.failureReason =
                  providerRefund.error_description ||
                  "Razorpay confirmed refund failure";

                refundRecord.providerStatusCheckedAt = new Date();
              }

              refundRecord.providerRefundId = providerRefund.id;

              await refundRecord.save({ session });

              if (reconciliationReasons.length > 0) {
                payment.refundReconciliationRequired = true;

                payment.refundReconciliationReason = [
                  payment.refundReconciliationReason,
                  ...reconciliationReasons,
                ]
                  .filter(Boolean)
                  .join(" | ");

                payment.refundReconciliationAt = new Date();

                await payment.save({ session });
              }

              return;
            }

            // ------------------------------------
            // PROVIDER REFUND PROCESSED
            // ------------------------------------
            if (providerRefund.status === "processed") {
              const wasPreviouslyFailedAndReleased =
                previousStatus === "Failed" &&
                Boolean(refundRecord.reservationReleasedAt);

              // An old attempt processed after a retry was started.
              if (wasPreviouslyFailedAndReleased || !isCurrentReturnAttempt) {
                reconciliationReasons.push(
                  `Late processed refund detected for return ${refundRecord.referenceId}, attempt ${refundRecord.attempt}. Manual reconciliation is required.`,
                );
              }

              refundRecord.providerRefundId = providerRefund.id;
              refundRecord.status = "Processed";
              refundRecord.providerStatus = "processed";
              refundRecord.processedAt = refundRecord.processedAt || new Date();
              refundRecord.providerStatusCheckedAt = new Date();

              // Release reservation exactly once.
              if (!refundRecord.reservationReleasedAt) {
                const releasedPayment = await Payment.findOneAndUpdate(
                  {
                    _id: payment._id,
                    reservedRefundAmount: {
                      $gte: refundRecord.amount,
                    },
                  },
                  {
                    $inc: {
                      reservedRefundAmount: -refundRecord.amount,
                    },
                  },
                  {
                    new: true,
                    session,
                  },
                );

                if (releasedPayment) {
                  refundRecord.reservationReleasedAt = new Date();
                } else {
                  // Do not lose the fact that Razorpay actually refunded.
                  // Record the refund and flag reconciliation instead.
                  reconciliationReasons.push(
                    `Unable to release reservation for refund attempt ${refundRecord.attempt}.`,
                  );
                }
              }

              await refundRecord.save({ session });

              // Update Return only if this attempt is still current.
              if (
                refundRecord.referenceType === "Return" &&
                returnRequest &&
                isCurrentReturnAttempt &&
                returnRequest.status === "RefundProcessing"
              ) {
                returnRequest.status = "Refunded";
                returnRequest.refundedAt = new Date();
                returnRequest.refundProcessedAt = new Date();

                await returnRequest.save({ session });

                refundNotification = {
                  recipient: returnRequest.user,
                  title: "Return Refund Completed",
                  message: `Your refund for return ${returnRequest.returnNumber} has been processed.`,
                  type: "REFUND_SUCCESS",
                  relatedId: returnRequest._id,
                  relatedModel: "Return",
                };
              }

              // Recalculate refunded amount from processed records.
              const processedRefunds = await PaymentRefund.find({
                payment: payment._id,
                status: "Processed",
              }).session(session);

              const totalRefunded = Number(
                processedRefunds
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toFixed(2),
              );

              const latestPayment = await Payment.findById(payment._id).session(
                session,
              );

              if (!latestPayment) {
                throw createError("Payment record not found", 404);
              }

              const reservedAmount = Number(
                (latestPayment.reservedRefundAmount || 0).toFixed(2),
              );

              // Detect refund total exceeding captured payment.
              if (
                Number((totalRefunded + reservedAmount).toFixed(2)) >
                latestPayment.amount
              ) {
                reconciliationReasons.push(
                  "Processed refunds plus reserved refunds exceed the captured payment amount.",
                );
              }

              latestPayment.refundedAmount = totalRefunded;

              if (totalRefunded >= latestPayment.amount) {
                latestPayment.status = "Refunded";
              } else if (totalRefunded > 0) {
                latestPayment.status = "PartiallyRefunded";
              }

              // Never automatically clear this flag.
              if (reconciliationReasons.length > 0) {
                latestPayment.refundReconciliationRequired = true;

                latestPayment.refundReconciliationReason = [
                  latestPayment.refundReconciliationReason,
                  ...reconciliationReasons,
                ]
                  .filter(Boolean)
                  .join(" | ");

                latestPayment.refundReconciliationAt = new Date();
              }

              await latestPayment.save({ session });

              // Update order payment status.
              const order = await Order.findById(latestPayment.order).session(
                session,
              );

              if (order) {
                if (latestPayment.status === "Refunded") {
                  order.paymentStatus = "Refunded";
                } else if (latestPayment.status === "PartiallyRefunded") {
                  order.paymentStatus = "PartiallyRefunded";
                }

                await order.save({ session });
              }
            }
          } else {
            // ------------------------------------
            // LEGACY FULL-ORDER REFUND
            // ------------------------------------
            const payment = await Payment.findOne({
              razorpayPaymentId: providerRefund.payment_id,
            }).session(session);

            if (!payment || payment.refundId !== providerRefund.id) {
              throw createError("Refund record not found", 404);
            }

            if (providerRefund.status === "processed") {
              payment.status = "Refunded";
              payment.refundedAt = new Date();
              payment.refundId = providerRefund.id;

              await payment.save({ session });

              await Order.updateOne(
                { _id: payment.order },
                {
                  $set: {
                    paymentStatus: "Refunded",
                  },
                },
                { session },
              );
            } else if (providerRefund.status === "failed") {
              payment.status = "Paid";
              payment.refundId = null;
              payment.refundIdempotencyKey = null;
              payment.failureReason =
                providerRefund.error_description || "Razorpay refund failed";

              await payment.save({ session });

              await Order.updateOne(
                { _id: payment.order },
                {
                  $set: {
                    paymentStatus: "Paid",
                  },
                },
                { session },
              );
            }
          }
        });
      } finally {
        await session.endSession();
      }

      // Send notification outside the transaction.
      if (refundNotification) {
        try {
          await createNotification(refundNotification);
        } catch (error) {
          console.error("Refund notification error:", error.message);
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
    }

    // 4. Ignore unsupported events safely.
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

    // 5. Handle payment webhooks.
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

        // ------------------------------------
        // PAYMENT CAPTURED
        // ------------------------------------
        if (event.event === "payment.captured") {
          if (
            razorpayPayment.amount !== Math.round(payment.amount * 100) ||
            razorpayPayment.currency !== payment.currency
          ) {
            throw createError("Payment amount or currency mismatch", 400);
          }

          // Never change a refund-related payment status.
          if (
            ["RefundPending", "PartiallyRefunded", "Refunded"].includes(
              payment.status,
            )
          ) {
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

            paymentNotification = {
              payment,
              type: "PAYMENT_SUCCESS",
              title: "Payment Successful",
              message: "Your payment has been successfully completed.",
            };
          }

          if (order.paymentStatus !== "Paid") {
            order.paymentStatus = "Paid";
            await order.save({ session });
          }
        }

        // ------------------------------------
        // PAYMENT FAILED
        // ------------------------------------
        if (event.event === "payment.failed") {
          if (
            ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"].includes(
              payment.status,
            ) ||
            ["Paid", "PartiallyRefunded", "Refunded"].includes(
              order.paymentStatus,
            )
          ) {
            return;
          }

          const alreadyFailed = payment.status === "Failed";

          payment.status = "Failed";
          payment.razorpayPaymentId = razorpayPayment.id;
          payment.failureReason =
            razorpayPayment.error_description || "Payment failed";

          await payment.save({ session });

          order.paymentStatus = "Failed";
          await order.save({ session });

          if (!alreadyFailed) {
            paymentNotification = {
              payment,
              type: "PAYMENT_FAILED",
              title: "Payment Failed",
              message: "Your payment could not be completed. Please try again.",
            };
          }
        }
      });
    } finally {
      await session.endSession();
    }

    if (paymentNotification) {
      await sendPaymentNotification(paymentNotification);
    }

    // 6. Automatically refund captured payments for cancelled orders.
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
