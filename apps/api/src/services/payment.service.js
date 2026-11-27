import crypto from "crypto";

import mongoose from "mongoose";

import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import razorpay from "../config/razorpay.js";
import WebhookEvent from "../models/webhook-event.model.js";
import { createNotification } from "./notification.service.js";
import PaymentRefund from "../models/payment-refund.model.js";
import Return from "../models/return.model.js";
import User from "../models/user.model.js";
import {
  createRazorpayRefund,
  fetchRazorpayPaymentRefunds,
  fetchRazorpayRefund,
  fromPaise,
  toPaise,
} from "../utils/razorpayGateway.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const buildCancellationReceipt = (orderId, attempt) =>
  `oc_${String(orderId).slice(-16)}_a${attempt}`.slice(0, 40);

export const sanitizePaymentForCustomer = (payment) => {
  if (!payment) return null;
  const doc = typeof payment.toObject === "function" ? payment.toObject() : payment;

  return {
    _id: doc._id,
    order: doc.order,
    provider: doc.provider,
    razorpayOrderId: doc.razorpayOrderId || null,
    razorpayPaymentId: doc.razorpayPaymentId || null,
    amount: doc.amount,
    currency: doc.currency || "INR",
    status: doc.status,
    paymentMethod: doc.paymentMethod || null,
    verifiedAt: doc.verifiedAt || null,
    refundedAmount: Number(doc.refundedAmount || 0),
    createdAt: doc.createdAt || null,
  };
};

export const sanitizeRefundForCustomer = (refund) => {
  if (!refund) return null;
  const doc = typeof refund.toObject === "function" ? refund.toObject() : refund;

  return {
    _id: doc._id,
    referenceType: doc.referenceType,
    attempt: doc.attempt,
    provider: doc.provider,
    amount: doc.amount,
    currency: doc.currency || "INR",
    status: doc.status,
    providerRefundId: doc.providerRefundId || null,
    reason: doc.reason || "",
    failureReason: doc.status === "Failed" ? doc.failureReason || null : null,
    processedAt: doc.processedAt || null,
    createdAt: doc.createdAt || null,
  };
};

export const buildRefundSummary = ({ order, payment = null, refunds = [] } = {}) => {
  const latestRefund = refunds[0] || null;
  const isCOD = order?.paymentMethod === "COD";

  let status = order?.refundStatus || "NOT_REQUIRED";
  if (
    (!order?.refundStatus || order.refundStatus === "NOT_REQUIRED") &&
    order?.orderStatus === "Cancelled"
  ) {
    if (latestRefund) {
      if (latestRefund.status === "Processed") status = "SUCCESS";
      else if (latestRefund.uncertainState) status = "RECONCILIATION_REQUIRED";
      else if (latestRefund.status === "Processing") status = "PROCESSING";
      else if (latestRefund.status === "Failed") status = "FAILED";
      else status = "PENDING";
    } else if (order?.paymentStatus === "Refunded") {
      status = "SUCCESS";
    } else if (order?.paymentStatus === "Paid" && !isCOD) {
      status = "PENDING";
    } else {
      status = "NOT_REQUIRED";
    }
  }

  return {
    status,
    amount:
      Number(order?.refundAmount) > 0
        ? Number(order.refundAmount)
        : Number(latestRefund?.amount || 0),
    currency: latestRefund?.currency || payment?.currency || "INR",
    method:
      latestRefund?.provider ||
      (order?.paymentMethod === "Online" ? "Razorpay" : "Manual"),
    gatewayRefundId:
      latestRefund?.providerRefundId || payment?.refundId || null,
    requestedAt: order?.refundRequestedAt || latestRefund?.createdAt || null,
    processedAt:
      order?.refundCompletedAt ||
      latestRefund?.processedAt ||
      payment?.refundedAt ||
      null,
    failureReason:
      status === "FAILED" || status === "RECONCILIATION_REQUIRED"
        ? order?.refundFailureReason || latestRefund?.failureReason || null
        : null,
    refunds: refunds.map(sanitizeRefundForCustomer),
  };
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

  // Verify Razorpay signature.
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

  // Verify payment directly with Razorpay.
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
    let notificationRequired = false;

    await session.withTransaction(async () => {
      const currentPayment = await Payment.findById(payment._id).session(
        session,
      );

      if (!currentPayment) {
        throw createError("Payment record not found", 404);
      }

      // Idempotent verification.
      if (currentPayment.status === "Paid") {
        if (currentPayment.razorpayPaymentId !== razorpay_payment_id) {
          throw createError("Payment ID mismatch", 409);
        }

        updatedPayment = currentPayment;
        return;
      }

      // Never downgrade refund-related payment states.
      if (
        ["RefundPending", "PartiallyRefunded", "Refunded"].includes(
          currentPayment.status,
        )
      ) {
        throw createError(
          "Payment cannot be verified in its current status",
          409,
        );
      }

      if (!["Created", "Failed"].includes(currentPayment.status)) {
        throw createError("Payment is not available for verification", 409);
      }

      const order = await Order.findById(currentPayment.order).session(session);

      if (!order || order.user.toString() !== userId.toString()) {
        throw createError("Order not found", 404);
      }

      // Check whether another payment attempt has already succeeded.
      const anotherSuccessfulPayment = await Payment.findOne({
        order: order._id,
        _id: { $ne: currentPayment._id },
        status: {
          $in: ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"],
        },
      }).session(session);

      const reconciliationReasons = [];

      if (anotherSuccessfulPayment) {
        reconciliationReasons.push(
          `Duplicate successful payment detected. Existing payment: ${anotherSuccessfulPayment._id}. New payment: ${currentPayment._id}.`,
        );
      }

      // Cancelled orders must not be silently marked as paid.
      if (order.orderStatus === "Cancelled") {
        reconciliationReasons.push(
          "Payment was captured for a cancelled order. Refund or manual reconciliation is required.",
        );
      }

      currentPayment.razorpayPaymentId = razorpay_payment_id;
      currentPayment.signature = razorpay_signature;
      currentPayment.paymentMethod = razorpayPayment.method || null;
      currentPayment.status = "Paid";
      currentPayment.verifiedAt = new Date();
      currentPayment.failureReason = null;

      if (reconciliationReasons.length > 0) {
        currentPayment.refundReconciliationRequired = true;
        currentPayment.refundReconciliationReason = [
          currentPayment.refundReconciliationReason,
          ...reconciliationReasons,
        ]
          .filter(Boolean)
          .join(" | ");
        currentPayment.refundReconciliationAt = new Date();
      }

      await currentPayment.save({ session });

      // Update order only if it is active and no other
      // successful payment attempt exists.
      if (
        order.orderStatus !== "Cancelled" &&
        !anotherSuccessfulPayment &&
        order.paymentStatus !== "Paid"
      ) {
        order.paymentStatus = "Paid";
        await order.save({ session });
      } else if (
        order.orderStatus === "Cancelled" &&
        order.refundStatus !== "SUCCESS"
      ) {
        order.refundStatus = "RECONCILIATION_REQUIRED";
        order.refundAmount = order.refundAmount || currentPayment.amount;
        order.refundRequestedAt = order.refundRequestedAt || new Date();
        order.refundFailureReason =
          "Payment was captured after order cancellation. Admin review required.";
        await order.save({ session });
      }

      notificationRequired =
        !anotherSuccessfulPayment && order.orderStatus !== "Cancelled";

      updatedPayment = currentPayment;
    });

    if (notificationRequired) {
      await sendPaymentNotification({
        payment: updatedPayment,
        type: "PAYMENT_SUCCESS",
        title: "Payment Successful",
        message: "Your payment has been successfully completed.",
      });
    }

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
  const processingToken = crypto.randomUUID();

  try {
    webhookRecord = await WebhookEvent.create({
      eventId,
      event: event.event,
      status: "Processing",
      processingToken,
      processingStartedAt: new Date(),
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
          processingToken,
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

  // Update webhook status only if this worker still owns the event.
  const updateWebhookStatus = async (status) => {
    const update = { status };

    if (status === "Processed") {
      update.processedAt = new Date();
    }

    const result = await WebhookEvent.updateOne(
      {
        _id: webhookRecord._id,
        processingToken,
        status: "Processing",
      },
      {
        $set: update,
      },
    );

    if (result.matchedCount !== 1) {
      throw createError("Webhook processing ownership lost", 409);
    }
  };

  const assertWebhookOwnership = async (session) => {
    const result = await WebhookEvent.updateOne(
      {
        _id: webhookRecord._id,
        processingToken,
        status: "Processing",
      },
      {
        $set: {
          processingStartedAt: new Date(),
        },
      },
      { session },
    );

    if (result.matchedCount !== 1) {
      throw createError("Webhook processing ownership lost", 409);
    }
  };

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
          await assertWebhookOwnership(session);
          let refundRecord = await PaymentRefund.findOne({
            providerRefundId: providerRefund.id,
            provider: "Razorpay",
          }).session(session);

          // Fallback lookup using Razorpay refund notes.
          if (!refundRecord) {
            const returnId = providerRefund.notes?.returnId;
            const noteOrderId = providerRefund.notes?.orderId;
            const attempt = Number(providerRefund.notes?.attempt);

            if (returnId && Number.isInteger(attempt) && attempt > 0) {
              refundRecord = await PaymentRefund.findOne({
                referenceType: "Return",
                referenceId: returnId,
                attempt,
                provider: "Razorpay",
              }).session(session);
            } else if (noteOrderId && Number.isInteger(attempt) && attempt > 0) {
              refundRecord = await PaymentRefund.findOne({
                referenceType: "OrderCancellation",
                referenceId: noteOrderId,
                attempt,
                provider: "Razorpay",
              }).session(session);
            }
          }

          // ------------------------------------
          // UNIFIED REFUND RECORD FLOW (Return & OrderCancellation)
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
              providerRefund.amount !== toPaise(refundRecord.amount)
            ) {
              throw createError("Refund amount mismatch", 409);
            }

            const previousStatus = refundRecord.status;
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

            const cancellationOrder =
              refundRecord.referenceType === "OrderCancellation"
                ? await Order.findById(refundRecord.order).session(session)
                : null;

            // ------------------------------------
            // PROVIDER REFUND PENDING
            // ------------------------------------
            if (providerRefund.status === "pending") {
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
                refundRecord.uncertainState = false;
                refundRecord.providerStatusCheckedAt = new Date();
              }

              refundRecord.providerRefundId = providerRefund.id;

              await refundRecord.save({ session });

              if (
                cancellationOrder &&
                cancellationOrder.refundStatus !== "SUCCESS"
              ) {
                cancellationOrder.refundStatus = "PROCESSING";
                cancellationOrder.refundFailureReason = null;
                await cancellationOrder.save({ session });
              }

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
              if (previousStatus === "Processed") {
                reconciliationReasons.push(
                  `Razorpay reported failed for an already processed refund attempt ${refundRecord.attempt}.`,
                );
              } else {
                refundRecord.status = "Failed";
                refundRecord.providerStatus = "failed";
                refundRecord.uncertainState = false;
                refundRecord.failureReason =
                  providerRefund.error_description ||
                  "Razorpay confirmed refund failure";
                refundRecord.providerStatusCheckedAt = new Date();

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

                    const activePendingRefunds = await PaymentRefund.countDocuments({
                      payment: payment._id,
                      _id: { $ne: refundRecord._id },
                      status: { $in: ["Pending", "Processing"] },
                    }).session(session);

                    if (
                      activePendingRefunds === 0 &&
                      releasedPayment.status === "RefundPending"
                    ) {
                      releasedPayment.status =
                        toPaise(releasedPayment.refundedAmount) > 0
                          ? "PartiallyRefunded"
                          : "Paid";
                      await releasedPayment.save({ session });
                    }
                  } else {
                    reconciliationReasons.push(
                      `Unable to release reservation for failed refund attempt ${refundRecord.attempt}.`,
                    );
                  }
                }
              }

              refundRecord.providerRefundId = providerRefund.id;

              await refundRecord.save({ session });

              if (
                cancellationOrder &&
                cancellationOrder.refundStatus !== "SUCCESS"
              ) {
                cancellationOrder.refundStatus = "FAILED";
                cancellationOrder.refundFailureReason =
                  refundRecord.failureReason ||
                  "Razorpay confirmed refund failure";
                await cancellationOrder.save({ session });
              }

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

              if (
                wasPreviouslyFailedAndReleased ||
                (refundRecord.referenceType === "Return" &&
                  !isCurrentReturnAttempt)
              ) {
                reconciliationReasons.push(
                  `Late processed refund detected for ${refundRecord.referenceType} ${refundRecord.referenceId}, attempt ${refundRecord.attempt}. Manual reconciliation is required.`,
                );
              }

              refundRecord.providerRefundId = providerRefund.id;
              refundRecord.status = "Processed";
              refundRecord.providerStatus = "processed";
              refundRecord.uncertainState = false;
              refundRecord.failureReason = null;
              refundRecord.processedAt = refundRecord.processedAt || new Date();
              refundRecord.providerStatusCheckedAt = new Date();

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
                  reconciliationReasons.push(
                    `Unable to release reservation for refund attempt ${refundRecord.attempt}.`,
                  );
                }
              }

              await refundRecord.save({ session });

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
                  type: "REFUND_PROCESSED",
                  relatedId: returnRequest.order,
                  relatedModel: "Order",
                };
              }

              const processedRefunds = await PaymentRefund.find({
                payment: payment._id,
                status: "Processed",
              }).session(session);

              const totalRefundedPaise = processedRefunds.reduce(
                (sum, item) => sum + toPaise(item.amount),
                0,
              );
              const totalRefunded = fromPaise(totalRefundedPaise);

              const latestPayment = await Payment.findById(payment._id).session(
                session,
              );

              if (!latestPayment) {
                throw createError("Payment record not found", 404);
              }

              const paymentAmountPaise = toPaise(latestPayment.amount);
              const reservedPaise = toPaise(latestPayment.reservedRefundAmount);

              if (totalRefundedPaise + reservedPaise > paymentAmountPaise) {
                reconciliationReasons.push(
                  "Processed refunds plus reserved refunds exceed the captured payment amount.",
                );
              }

              latestPayment.refundedAmount = totalRefunded;

              if (totalRefundedPaise >= paymentAmountPaise) {
                latestPayment.status = "Refunded";
                latestPayment.refundId = providerRefund.id;
                latestPayment.refundedAt =
                  latestPayment.refundedAt || refundRecord.processedAt;
              } else if (totalRefundedPaise > 0) {
                latestPayment.status = "PartiallyRefunded";
              }

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

              const order = await Order.findById(latestPayment.order).session(
                session,
              );

              if (order) {
                if (latestPayment.status === "Refunded") {
                  order.paymentStatus = "Refunded";
                } else if (latestPayment.status === "PartiallyRefunded") {
                  order.paymentStatus = "PartiallyRefunded";
                }

                if (refundRecord.referenceType === "OrderCancellation") {
                  order.refundStatus =
                    reconciliationReasons.length > 0
                      ? "RECONCILIATION_REQUIRED"
                      : "SUCCESS";
                  order.refundCompletedAt =
                    order.refundCompletedAt || refundRecord.processedAt;
                  order.refundFailureReason = null;

                  refundNotification = {
                    recipient: order.user,
                    title: "Refund Completed",
                    message: `Your refund of ₹${Number(refundRecord.amount).toFixed(2)} for cancelled order ${order.orderNumber} has been processed.`,
                    type: "REFUND_PROCESSED",
                    relatedId: order._id,
                    relatedModel: "Order",
                  };
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
              payment.refundedAmount = payment.amount;
              payment.refundedAt = new Date();
              payment.refundId = providerRefund.id;

              await payment.save({ session });

              await Order.updateOne(
                { _id: payment.order },
                {
                  $set: {
                    paymentStatus: "Refunded",
                    refundStatus: "SUCCESS",
                    refundCompletedAt: payment.refundedAt,
                    refundFailureReason: null,
                  },
                },
                { session },
              );
            } else if (providerRefund.status === "failed") {
              const failureReason =
                providerRefund.error_description || "Razorpay refund failed";
              payment.status = "Paid";
              payment.refundId = null;
              payment.refundIdempotencyKey = null;
              payment.failureReason = failureReason;

              await payment.save({ session });

              await Order.updateOne(
                { _id: payment.order },
                {
                  $set: {
                    paymentStatus: "Paid",
                    refundStatus: "FAILED",
                    refundFailureReason: failureReason,
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

      await updateWebhookStatus("Processed");

      return {
        received: true,
        processed: true,
      };
    }

    // 4. Ignore unsupported events safely.
    if (!["payment.captured", "payment.failed"].includes(event.event)) {
      await updateWebhookStatus("Processed");

      return {
        received: true,
        processed: false,
      };
    }

    // 5. Handle payment webhooks.
    const razorpayPayment = event.payload?.payment?.entity;

    if (
      !razorpayPayment?.order_id ||
      !razorpayPayment?.id ||
      !Number.isFinite(razorpayPayment.amount) ||
      !razorpayPayment.currency
    ) {
      throw createError("Invalid payment webhook data", 400);
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await assertWebhookOwnership(session);

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

        // Validate amount and currency.
        if (
          razorpayPayment.amount !== Math.round(payment.amount * 100) ||
          razorpayPayment.currency !== payment.currency
        ) {
          throw createError("Payment amount or currency mismatch", 400);
        }

        // ------------------------------------
        // PAYMENT CAPTURED
        // ------------------------------------
        if (event.event === "payment.captured") {
          const capturedPaymentId = razorpayPayment.id;

          // Same payment already processed.
          if (
            payment.status === "Paid" &&
            payment.razorpayPaymentId === capturedPaymentId
          ) {
            return;
          }

          // Check whether another payment attempt for this
          // order has already been successfully paid.
          const anotherSuccessfulPayment = await Payment.findOne({
            order: order._id,
            _id: { $ne: payment._id },
            status: {
              $in: ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"],
            },
          }).session(session);

          const reconciliationReasons = [];

          if (anotherSuccessfulPayment) {
            reconciliationReasons.push(
              `Duplicate successful payment detected. Existing payment: ${anotherSuccessfulPayment._id}. Captured payment: ${payment._id}. Razorpay payment ID: ${capturedPaymentId}.`,
            );
          }

          if (
            payment.razorpayPaymentId &&
            payment.razorpayPaymentId !== capturedPaymentId &&
            payment.status !== "Failed"
          ) {
            reconciliationReasons.push(
              `Different Razorpay payment ID detected for the same payment record. Previous: ${payment.razorpayPaymentId}, New: ${capturedPaymentId}.`,
            );
          }

          // A previously captured payment must not be overwritten
          // with a different payment ID.
          if (
            payment.status === "Paid" &&
            payment.razorpayPaymentId !== capturedPaymentId
          ) {
            reconciliationReasons.push(
              "A second captured payment was detected for an already paid payment record.",
            );

            payment.refundReconciliationRequired = true;
            payment.refundReconciliationReason = [
              payment.refundReconciliationReason,
              ...reconciliationReasons,
            ]
              .filter(Boolean)
              .join(" | ");

            payment.refundReconciliationAt = new Date();

            await payment.save({ session });
            return;
          }

          // Refund-related states must not be downgraded.
          if (
            ["RefundPending", "PartiallyRefunded", "Refunded"].includes(
              payment.status,
            )
          ) {
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

          // A Failed payment can become Paid if Razorpay confirms
          // that the payment was actually captured.
          payment.razorpayPaymentId = capturedPaymentId;
          payment.paymentMethod = razorpayPayment.method || null;
          payment.status = "Paid";
          payment.verifiedAt = payment.verifiedAt || new Date();
          payment.failureReason = null;

          if (reconciliationReasons.length > 0) {
            payment.refundReconciliationRequired = true;
            payment.refundReconciliationReason = [
              payment.refundReconciliationReason,
              ...reconciliationReasons,
            ]
              .filter(Boolean)
              .join(" | ");

            payment.refundReconciliationAt = new Date();
          }

          await payment.save({ session });

          // Cancelled orders must retain their cancelled status.
          // Automatic refund is handled after this transaction.
          if (order.orderStatus === "Cancelled") {
            if (order.paymentStatus === "Pending") {
              order.paymentStatus = "Paid";
            }
            if (!order.refundStatus || order.refundStatus === "NOT_REQUIRED") {
              order.refundStatus = "PENDING";
              order.refundAmount = order.refundAmount || payment.amount;
              order.refundRequestedAt = order.refundRequestedAt || new Date();
            }
            await order.save({ session });
            return;
          }

          // Do not overwrite an order already paid by another attempt.
          if (!anotherSuccessfulPayment) {
            if (order.paymentStatus !== "Paid") {
              order.paymentStatus = "Paid";
              await order.save({ session });
            }

            paymentNotification = {
              payment,
              type: "PAYMENT_SUCCESS",
              title: "Payment Successful",
              message: "Your payment has been successfully completed.",
            };
          }
        }

        // ------------------------------------
        // PAYMENT FAILED
        // ------------------------------------
        if (event.event === "payment.failed") {
          // Never downgrade a successful or refund-related payment.
          if (
            ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"].includes(
              payment.status,
            )
          ) {
            return;
          }

          // Do not overwrite a payment record already associated
          // with a different Razorpay payment ID.
          if (
            payment.razorpayPaymentId &&
            payment.razorpayPaymentId !== razorpayPayment.id
          ) {
            return;
          }

          // Only update an attempt that is still Created or
          // already Failed. Old attempts must not affect newer ones.
          if (!["Created", "Failed"].includes(payment.status)) {
            return;
          }

          const alreadyFailed = payment.status === "Failed";

          payment.status = "Failed";
          payment.razorpayPaymentId = razorpayPayment.id;
          payment.failureReason =
            razorpayPayment.error_description || "Payment failed";

          await payment.save({ session });

          // Check whether another attempt has already succeeded.
          const successfulPayment = await Payment.findOne({
            order: order._id,
            _id: { $ne: payment._id },
            status: {
              $in: ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"],
            },
          }).session(session);

          // Only update order status when no successful attempt exists.
          if (
            !successfulPayment &&
            !["Paid", "PartiallyRefunded", "Refunded"].includes(
              order.paymentStatus,
            )
          ) {
            order.paymentStatus = "Failed";
            await order.save({ session });
          }

          if (!alreadyFailed && !successfulPayment) {
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
          try {
            await initiateOrderCancellationRefund({
              orderId: order._id,
              paymentId: payment._id,
              reason: "Automatic refund for cancelled order",
              initiatedByRole: "SYSTEM",
              swallowGatewayError: true,
            });
          } catch (autoRefundError) {
            console.error(
              "Automatic cancellation refund failed:",
              autoRefundError.message,
            );
          }
        }
      }
    }

    await updateWebhookStatus("Processed");

    return {
      received: true,
      processed: true,
    };
  } catch (error) {
    try {
      await updateWebhookStatus("Failed");
    } catch (updateError) {
      console.error("Webhook status update error:", updateError.message);
    }

    throw error;
  }
};

const TIMEOUT_RECONCILIATION_MARKER =
  "Cancellation refund gateway timeout/uncertain response";

const clearTimeoutReconciliationIfSoleCause = (payment) => {
  if (!payment?.refundReconciliationRequired) return;

  const parts = String(payment.refundReconciliationReason || "")
    .split(" | ")
    .map((part) => part.trim())
    .filter(Boolean);

  const remainingReasons = parts.filter(
    (part) => !part.startsWith(TIMEOUT_RECONCILIATION_MARKER),
  );

  if (remainingReasons.length === 0) {
    payment.refundReconciliationRequired = false;
    payment.refundReconciliationReason = null;
    payment.refundReconciliationAt = null;
  }
};

export const reserveCancellationRefundInSession = async ({
  order,
  payment,
  userId = null,
  initiatedByRole = "USER",
  reason = "Order cancellation refund",
  amount = null,
  session,
}) => {
  if (!order || order.orderStatus !== "Cancelled") {
    throw createError("Cancel the order before processing a refund", 400);
  }

  if (!payment || payment.order.toString() !== order._id.toString()) {
    throw createError("Captured payment not found for this order", 404);
  }

  if (!["Paid", "PartiallyRefunded"].includes(payment.status)) {
    throw createError("Only paid payments can be refunded", 400);
  }

  if (!payment.razorpayPaymentId) {
    throw createError("Razorpay payment ID not found", 400);
  }

  if (payment.refundReconciliationRequired) {
    throw createError(
      "Payment requires manual reconciliation before issuing another refund",
      409,
    );
  }

  const activeRefund = await PaymentRefund.findOne({
    referenceType: "OrderCancellation",
    referenceId: order._id,
    status: { $in: ["Pending", "Processing"] },
  }).session(session);

  if (activeRefund) {
    const err = createError(
      activeRefund.uncertainState
        ? "Previous refund attempt had a gateway timeout. Sync refund status before retrying."
        : "A cancellation refund attempt is already in progress",
      409,
    );
    err.code = "REFUND_IN_PROGRESS";
    err.existingRefund = activeRefund;
    throw err;
  }

  const paymentAmountPaise = toPaise(payment.amount);
  const refundedPaise = toPaise(payment.refundedAmount);
  const reservedPaise = toPaise(payment.reservedRefundAmount);
  const remainingPaise = paymentAmountPaise - refundedPaise - reservedPaise;

  if (remainingPaise <= 0) {
    return {
      alreadyFullyRefunded: true,
      paymentRefund: null,
      payment,
      order,
    };
  }

  let requestedPaise;
  if (amount !== null && amount !== undefined) {
    requestedPaise = toPaise(amount);
    if (!Number.isInteger(requestedPaise) || requestedPaise <= 0) {
      throw createError("Refund amount must be greater than zero", 400);
    }
    if (requestedPaise > remainingPaise) {
      throw createError(
        `Refund amount exceeds remaining refundable balance (₹${fromPaise(remainingPaise).toFixed(2)})`,
        409,
      );
    }
  } else {
    requestedPaise = Math.min(toPaise(order.totalAmount), remainingPaise);
    if (requestedPaise <= 0) {
      return {
        alreadyFullyRefunded: true,
        paymentRefund: null,
        payment,
        order,
      };
    }
  }

  const refundAmount = fromPaise(requestedPaise);

  const latestAttempt = await PaymentRefund.findOne({
    referenceType: "OrderCancellation",
    referenceId: order._id,
  })
    .sort({ attempt: -1 })
    .session(session);

  if (
    latestAttempt &&
    latestAttempt.status === "Failed" &&
    !latestAttempt.reservationReleasedAt
  ) {
    throw createError(
      "Previous failed refund reservation has not been released safely",
      409,
    );
  }

  const attempt = latestAttempt ? latestAttempt.attempt + 1 : 1;

  const reservedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: { $in: ["Paid", "PartiallyRefunded"] },
      refundReconciliationRequired: { $ne: true },
      $expr: {
        $lte: [
          {
            $add: [
              { $ifNull: ["$refundedAmount", 0] },
              { $ifNull: ["$reservedRefundAmount", 0] },
              refundAmount,
            ],
          },
          { $add: ["$amount", 0.001] },
        ],
      },
    },
    {
      $inc: {
        reservedRefundAmount: refundAmount,
      },
    },
    { new: true, session },
  );

  if (!reservedPayment) {
    throw createError(
      "Refund amount exceeds the remaining refundable payment balance or reconciliation is required",
      409,
    );
  }

  const sanitizedReason = String(
    reason || order.cancellationReason || "Order cancellation refund",
  )
    .trim()
    .slice(0, 500);

  const paymentRefund = new PaymentRefund({
    payment: reservedPayment._id,
    order: order._id,
    user: order.user,
    referenceType: "OrderCancellation",
    referenceId: order._id,
    attempt,
    provider: "Razorpay",
    amount: refundAmount,
    currency: reservedPayment.currency || "INR",
    status: "Pending",
    idempotencyKey: `order-cancel-${order._id}-attempt-${attempt}`,
    reason: sanitizedReason,
    initiatedBy: userId || null,
    initiatedByRole,
  });

  await paymentRefund.save({ session });

  const requestedAt = order.refundRequestedAt || new Date();
  order.refundStatus = "PENDING";
  order.refundAmount = fromPaise(
    Math.min(
      paymentAmountPaise,
      refundedPaise + reservedPaise + requestedPaise,
    ),
  );
  order.refundRequestedAt = requestedAt;
  order.refundFailureReason = null;
  await order.save({ session });

  return {
    alreadyFullyRefunded: false,
    paymentRefund,
    payment: reservedPayment,
    order,
  };
};

const applyGatewayRefundOutcome = async ({
  paymentRefundId,
  providerRefund = null,
  gatewayError = null,
  clearTimeoutReconciliation = false,
}) => {
  const session = await mongoose.startSession();
  let result = {};
  let notificationPayload = null;

  try {
    await session.withTransaction(async () => {
      const refundRecord = await PaymentRefund.findById(paymentRefundId).session(
        session,
      );

      if (!refundRecord) {
        throw createError("Refund record not found", 404);
      }

      const payment = await Payment.findById(refundRecord.payment).session(
        session,
      );
      const order = await Order.findById(refundRecord.order).session(session);

      if (!payment || !order) {
        throw createError("Associated payment or order not found", 404);
      }

      if (refundRecord.status === "Processed") {
        result = { paymentRefund: refundRecord, payment, order };
        return;
      }

      const now = new Date();

      if (gatewayError) {
        if (gatewayError.isUncertain) {
          refundRecord.uncertainState = true;
          refundRecord.failureReason = gatewayError.message;
          await refundRecord.save({ session });

          payment.refundReconciliationRequired = true;
          payment.refundReconciliationReason = [
            payment.refundReconciliationReason,
            `${TIMEOUT_RECONCILIATION_MARKER} (attempt ${refundRecord.attempt})`,
          ]
            .filter(Boolean)
            .join(" | ");
          payment.refundReconciliationAt = now;
          await payment.save({ session });

          order.refundStatus = "RECONCILIATION_REQUIRED";
          order.refundFailureReason = gatewayError.message;
          await order.save({ session });

          result = { paymentRefund: refundRecord, payment, order };
          return;
        }

        // Deterministic gateway rejection before creating a refund.
        if (!refundRecord.reservationReleasedAt) {
          const released = await Payment.findOneAndUpdate(
            {
              _id: payment._id,
              reservedRefundAmount: { $gte: refundRecord.amount },
            },
            { $inc: { reservedRefundAmount: -refundRecord.amount } },
            { new: true, session },
          );

          if (released) {
            refundRecord.reservationReleasedAt = now;
          } else {
            payment.refundReconciliationRequired = true;
            payment.refundReconciliationReason = [
              payment.refundReconciliationReason,
              `Failed to release reserved refund amount for attempt ${refundRecord.attempt}`,
            ]
              .filter(Boolean)
              .join(" | ");
            payment.refundReconciliationAt = now;
            await payment.save({ session });
          }
        }

        refundRecord.status = "Failed";
        refundRecord.uncertainState = false;
        refundRecord.failureReason = gatewayError.message || "Refund failed";
        await refundRecord.save({ session });

        const latestPayment = await Payment.findById(payment._id).session(
          session,
        );
        const remainingActive = await PaymentRefund.countDocuments({
          payment: payment._id,
          _id: { $ne: refundRecord._id },
          status: { $in: ["Pending", "Processing"] },
        }).session(session);

        if (
          latestPayment &&
          remainingActive === 0 &&
          latestPayment.status === "RefundPending"
        ) {
          latestPayment.status =
            toPaise(latestPayment.refundedAmount) > 0
              ? "PartiallyRefunded"
              : "Paid";
          await latestPayment.save({ session });
        }

        order.refundStatus = "FAILED";
        order.refundFailureReason = refundRecord.failureReason;
        await order.save({ session });

        result = {
          paymentRefund: refundRecord,
          payment: latestPayment || payment,
          order,
        };
        return;
      }

      if (!providerRefund?.id || !providerRefund?.status) {
        throw createError("Invalid gateway refund outcome", 502);
      }

      refundRecord.providerRefundId = providerRefund.id;
      refundRecord.providerStatus = providerRefund.status;
      refundRecord.providerStatusCheckedAt = now;
      refundRecord.uncertainState = false;

      if (clearTimeoutReconciliation) {
        clearTimeoutReconciliationIfSoleCause(payment);
      }

      if (providerRefund.status === "pending") {
        refundRecord.status = "Processing";
        refundRecord.failureReason = null;
        await refundRecord.save({ session });

        if (toPaise(payment.refundedAmount) === 0 && payment.status === "Paid") {
          payment.status = "RefundPending";
        }
        payment.refundId = providerRefund.id;
        payment.refundReason = refundRecord.reason;
        await payment.save({ session });

        order.refundStatus = "PROCESSING";
        order.refundFailureReason = null;
        await order.save({ session });

        result = { paymentRefund: refundRecord, payment, order };
        return;
      }

      if (providerRefund.status === "failed") {
        if (!refundRecord.reservationReleasedAt) {
          const released = await Payment.findOneAndUpdate(
            {
              _id: payment._id,
              reservedRefundAmount: { $gte: refundRecord.amount },
            },
            { $inc: { reservedRefundAmount: -refundRecord.amount } },
            { new: true, session },
          );

          if (released) {
            refundRecord.reservationReleasedAt = now;
          } else {
            payment.refundReconciliationRequired = true;
            payment.refundReconciliationReason = [
              payment.refundReconciliationReason,
              `Failed to release reserved refund amount for gateway-failed attempt ${refundRecord.attempt}`,
            ]
              .filter(Boolean)
              .join(" | ");
            payment.refundReconciliationAt = now;
            await payment.save({ session });
          }
        }

        refundRecord.status = "Failed";
        refundRecord.failureReason =
          providerRefund.error_description || "Razorpay refund failed";
        await refundRecord.save({ session });

        const latestPayment = await Payment.findById(payment._id).session(
          session,
        );
        const remainingActive = await PaymentRefund.countDocuments({
          payment: payment._id,
          _id: { $ne: refundRecord._id },
          status: { $in: ["Pending", "Processing"] },
        }).session(session);

        if (
          latestPayment &&
          remainingActive === 0 &&
          latestPayment.status === "RefundPending"
        ) {
          latestPayment.status =
            toPaise(latestPayment.refundedAmount) > 0
              ? "PartiallyRefunded"
              : "Paid";
        }
        if (latestPayment && clearTimeoutReconciliation) {
          clearTimeoutReconciliationIfSoleCause(latestPayment);
        }
        if (latestPayment) {
          await latestPayment.save({ session });
        }

        order.refundStatus = "FAILED";
        order.refundFailureReason = refundRecord.failureReason;
        await order.save({ session });

        result = {
          paymentRefund: refundRecord,
          payment: latestPayment || payment,
          order,
        };
        return;
      }

      if (providerRefund.status === "processed") {
        if (!refundRecord.reservationReleasedAt) {
          const released = await Payment.findOneAndUpdate(
            {
              _id: payment._id,
              reservedRefundAmount: { $gte: refundRecord.amount },
            },
            { $inc: { reservedRefundAmount: -refundRecord.amount } },
            { new: true, session },
          );

          if (released) {
            refundRecord.reservationReleasedAt = now;
          } else {
            payment.refundReconciliationRequired = true;
            payment.refundReconciliationReason = [
              payment.refundReconciliationReason,
              `Unable to release reservation for processed refund attempt ${refundRecord.attempt}`,
            ]
              .filter(Boolean)
              .join(" | ");
            payment.refundReconciliationAt = now;
            await payment.save({ session });
          }
        }

        refundRecord.status = "Processed";
        refundRecord.processedAt = refundRecord.processedAt || now;
        refundRecord.failureReason = null;
        await refundRecord.save({ session });

        const processedRefunds = await PaymentRefund.find({
          payment: payment._id,
          status: "Processed",
        }).session(session);

        const totalRefundedPaise = processedRefunds.reduce(
          (sum, item) => sum + toPaise(item.amount),
          0,
        );
        const totalRefunded = fromPaise(totalRefundedPaise);

        const latestPayment = await Payment.findById(payment._id).session(
          session,
        );
        const paymentAmountPaise = toPaise(latestPayment.amount);

        if (
          totalRefundedPaise + toPaise(latestPayment.reservedRefundAmount) >
          paymentAmountPaise
        ) {
          latestPayment.refundReconciliationRequired = true;
          latestPayment.refundReconciliationReason = [
            latestPayment.refundReconciliationReason,
            "Processed plus reserved refunds exceed captured payment amount",
          ]
            .filter(Boolean)
            .join(" | ");
          latestPayment.refundReconciliationAt = now;
        } else if (clearTimeoutReconciliation) {
          clearTimeoutReconciliationIfSoleCause(latestPayment);
        }

        latestPayment.refundedAmount = totalRefunded;
        latestPayment.refundId = providerRefund.id;
        latestPayment.refundReason = refundRecord.reason;
        latestPayment.refundedAt =
          latestPayment.refundedAt || refundRecord.processedAt;
        latestPayment.status =
          totalRefundedPaise >= paymentAmountPaise
            ? "Refunded"
            : "PartiallyRefunded";

        await latestPayment.save({ session });

        order.paymentStatus =
          latestPayment.status === "Refunded" ? "Refunded" : "PartiallyRefunded";
        order.refundStatus = latestPayment.refundReconciliationRequired
          ? "RECONCILIATION_REQUIRED"
          : "SUCCESS";
        order.refundAmount = totalRefunded;
        order.refundCompletedAt = refundRecord.processedAt;
        order.refundFailureReason = null;
        await order.save({ session });

        notificationPayload = {
          recipient: order.user,
          title: "Refund Completed",
          message: `Your refund of ₹${Number(refundRecord.amount).toFixed(2)} for cancelled order ${order.orderNumber} has been processed.`,
          type: "REFUND_PROCESSED",
          relatedId: order._id,
          relatedModel: "Order",
        };

        result = { paymentRefund: refundRecord, payment: latestPayment, order };
      }
    });
  } finally {
    await session.endSession();
  }

  if (notificationPayload) {
    try {
      await createNotification(notificationPayload);
    } catch (error) {
      console.error("Refund notification error:", error.message);
    }
  }

  return result;
};

export const executeReservedRazorpayRefund = async ({
  paymentRefund,
  payment,
  order,
  swallowGatewayError = false,
}) => {
  try {
    const providerRefund = await createRazorpayRefund({
      razorpayPaymentId: payment.razorpayPaymentId,
      amountPaise: toPaise(paymentRefund.amount),
      receipt: buildCancellationReceipt(order._id, paymentRefund.attempt),
      idempotencyKey: paymentRefund.idempotencyKey,
      notes: {
        referenceType: "OrderCancellation",
        orderId: order._id.toString(),
        orderNumber: order.orderNumber || "",
        attempt: String(paymentRefund.attempt),
        idempotencyKey: paymentRefund.idempotencyKey,
        reason: paymentRefund.reason || "Order cancelled",
      },
    });

    return await applyGatewayRefundOutcome({
      paymentRefundId: paymentRefund._id,
      providerRefund,
    });
  } catch (gatewayError) {
    console.error("Razorpay Cancellation Refund Error:", {
      orderId: order._id?.toString(),
      attempt: paymentRefund.attempt,
      statusCode: gatewayError.statusCode,
      code: gatewayError.gatewayCode,
      isUncertain: Boolean(gatewayError.isUncertain),
      message: gatewayError.message,
    });

    const outcome = await applyGatewayRefundOutcome({
      paymentRefundId: paymentRefund._id,
      gatewayError,
    });

    if (swallowGatewayError) {
      return outcome;
    }

    throw gatewayError;
  }
};

export const syncOrderCancellationRefund = async (orderId, { adminId = null } = {}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw createError("Order not found", 404);
  }

  const latestRefund = await PaymentRefund.findOne({
    referenceType: "OrderCancellation",
    referenceId: order._id,
  }).sort({ attempt: -1 });

  if (!latestRefund) {
    throw createError(
      "No cancellation refund attempt found for this order",
      404,
    );
  }

  const payment = latestRefund.payment
    ? await Payment.findById(latestRefund.payment)
    : null;

  if (latestRefund.provider === "Manual") {
    return {
      refund: latestRefund,
      payment: sanitizePaymentForCustomer(payment),
      order,
      refundSummary: buildRefundSummary({
        order,
        payment,
        refunds: [latestRefund],
      }),
    };
  }

  if (!payment || !payment.razorpayPaymentId) {
    throw createError("Razorpay payment record not found for refund sync", 404);
  }

  if (latestRefund.status === "Processed") {
    return {
      refund: latestRefund,
      payment: sanitizePaymentForCustomer(payment),
      order,
      refundSummary: buildRefundSummary({
        order,
        payment,
        refunds: [latestRefund],
      }),
    };
  }

  let matchedGatewayRefund = null;

  if (latestRefund.providerRefundId) {
    matchedGatewayRefund = await fetchRazorpayRefund(
      latestRefund.providerRefundId,
    );
  } else {
    const paymentRefunds = await fetchRazorpayPaymentRefunds(
      payment.razorpayPaymentId,
    );
    const expectedReceipt = buildCancellationReceipt(
      order._id,
      latestRefund.attempt,
    );

    matchedGatewayRefund =
      paymentRefunds.find((item) => {
        if (item?.notes?.idempotencyKey === latestRefund.idempotencyKey) {
          return true;
        }
        if (
          String(item?.notes?.orderId || "") === order._id.toString() &&
          Number(item?.notes?.attempt) === latestRefund.attempt
        ) {
          return true;
        }
        if (item?.receipt && item.receipt === expectedReceipt) {
          return true;
        }
        return false;
      }) || null;
  }

  if (matchedGatewayRefund) {
    if (
      matchedGatewayRefund.payment_id &&
      matchedGatewayRefund.payment_id !== payment.razorpayPaymentId
    ) {
      throw createError("Razorpay refund payment ID mismatch", 409);
    }

    if (
      Number.isFinite(matchedGatewayRefund.amount) &&
      matchedGatewayRefund.amount !== toPaise(latestRefund.amount)
    ) {
      throw createError("Razorpay refund amount mismatch", 409);
    }

    const updated = await applyGatewayRefundOutcome({
      paymentRefundId: latestRefund._id,
      providerRefund: matchedGatewayRefund,
      clearTimeoutReconciliation: true,
    });

    const allRefunds = await PaymentRefund.find({ order: order._id }).sort({
      createdAt: -1,
    });

    return {
      syncedBy: adminId,
      refund: updated.paymentRefund,
      payment: sanitizePaymentForCustomer(updated.payment),
      order: updated.order,
      refundSummary: buildRefundSummary({
        order: updated.order,
        payment: updated.payment,
        refunds: allRefunds,
      }),
    };
  }

  // Confirmed absent on gateway (after an earlier timeout/uncertain POST).
  const session = await mongoose.startSession();
  let updatedRefund;
  let updatedPayment;
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const refundDoc = await PaymentRefund.findById(latestRefund._id).session(
        session,
      );
      const paymentDoc = await Payment.findById(payment._id).session(session);
      const orderDoc = await Order.findById(order._id).session(session);

      if (!refundDoc || !paymentDoc || !orderDoc) {
        throw createError("Refund reconciliation entities not found", 404);
      }

      if (!refundDoc.reservationReleasedAt) {
        const released = await Payment.findOneAndUpdate(
          {
            _id: paymentDoc._id,
            reservedRefundAmount: { $gte: refundDoc.amount },
          },
          { $inc: { reservedRefundAmount: -refundDoc.amount } },
          { new: true, session },
        );

        if (released) {
          refundDoc.reservationReleasedAt = new Date();
        }
      }

      refundDoc.status = "Failed";
      refundDoc.uncertainState = false;
      refundDoc.providerStatusCheckedAt = new Date();
      refundDoc.failureReason =
        "Gateway sync confirmed no refund was created for this timed-out attempt";
      await refundDoc.save({ session });

      const freshPayment = await Payment.findById(paymentDoc._id).session(
        session,
      );
      if (freshPayment) {
        clearTimeoutReconciliationIfSoleCause(freshPayment);
        if (freshPayment.status === "RefundPending") {
          freshPayment.status =
            toPaise(freshPayment.refundedAmount) > 0
              ? "PartiallyRefunded"
              : "Paid";
        }
        await freshPayment.save({ session });
      }

      orderDoc.refundStatus = "FAILED";
      orderDoc.refundFailureReason =
        "Previous gateway timeout was resolved with Razorpay. Safe to retry refund.";
      await orderDoc.save({ session });

      updatedRefund = refundDoc;
      updatedPayment = freshPayment || paymentDoc;
      updatedOrder = orderDoc;
    });
  } finally {
    await session.endSession();
  }

  const allRefunds = await PaymentRefund.find({ order: order._id }).sort({
    createdAt: -1,
  });

  return {
    syncedBy: adminId,
    refund: updatedRefund,
    payment: sanitizePaymentForCustomer(updatedPayment),
    order: updatedOrder,
    refundSummary: buildRefundSummary({
      order: updatedOrder,
      payment: updatedPayment,
      refunds: allRefunds,
    }),
  };
};

export const initiateOrderCancellationRefund = async ({
  orderId = null,
  paymentId = null,
  adminId = null,
  reason = null,
  amount = null,
  provider = null,
  manualRefundConfirmed = false,
  initiatedByRole = "ADMIN",
  swallowGatewayError = false,
} = {}) => {
  let payment = null;
  let order = null;

  if (paymentId) {
    payment = await Payment.findById(paymentId);
    if (!payment) {
      throw createError("Payment not found", 404);
    }
    order = await Order.findById(orderId || payment.order);
  } else if (orderId) {
    order = await Order.findById(orderId);
  }

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.orderStatus !== "Cancelled") {
    throw createError("Cancel the order before processing a refund", 400);
  }

  // Cash on Delivery orders follow strict manual COD refund rules.
  if (order.paymentMethod === "COD") {
    if (provider === "Razorpay") {
      throw createError(
        "Razorpay refund cannot be issued for Cash on Delivery orders",
        400,
      );
    }

    if (order.paymentStatus === "Refunded" && order.refundStatus === "SUCCESS") {
      const existingManual = await PaymentRefund.findOne({
        referenceType: "OrderCancellation",
        referenceId: order._id,
        status: "Processed",
      }).sort({ attempt: -1 });

      return {
        alreadyProcessed: true,
        refund: existingManual,
        payment: null,
        order,
      };
    }

    if (order.paymentStatus !== "Paid") {
      throw createError(
        "Refund is not required for unpaid Cash on Delivery orders",
        400,
      );
    }

    if (manualRefundConfirmed !== true) {
      throw createError(
        "Confirm that the manual refund has been transferred to the customer",
        400,
      );
    }

    const refundAmount =
      amount !== null && amount !== undefined
        ? fromPaise(toPaise(amount))
        : order.totalAmount;

    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      throw createError("Refund amount must be greater than zero", 400);
    }

    if (toPaise(refundAmount) > toPaise(order.totalAmount)) {
      throw createError("Refund amount cannot exceed total order amount", 400);
    }

    const session = await mongoose.startSession();
    let createdRefund;
    let updatedOrder;

    try {
      await session.withTransaction(async () => {
        const orderDoc = await Order.findOne({
          _id: order._id,
          orderStatus: "Cancelled",
          paymentStatus: "Paid",
        }).session(session);

        if (!orderDoc) {
          throw createError(
            "Order is no longer eligible for manual COD refund",
            409,
          );
        }

        const latestAttempt = await PaymentRefund.findOne({
          referenceType: "OrderCancellation",
          referenceId: orderDoc._id,
        })
          .sort({ attempt: -1 })
          .session(session);

        if (latestAttempt?.status === "Processed") {
          createdRefund = latestAttempt;
          updatedOrder = orderDoc;
          return;
        }

        const attempt = latestAttempt ? latestAttempt.attempt + 1 : 1;
        const now = new Date();

        createdRefund = new PaymentRefund({
          payment: null,
          order: orderDoc._id,
          user: orderDoc.user,
          referenceType: "OrderCancellation",
          referenceId: orderDoc._id,
          attempt,
          provider: "Manual",
          amount: refundAmount,
          currency: "INR",
          status: "Processed",
          idempotencyKey: `order-cancel-${orderDoc._id}-attempt-${attempt}`,
          reason:
            reason ||
            orderDoc.cancellationReason ||
            "Manual COD cancellation refund",
          initiatedBy: adminId,
          initiatedByRole,
          processedAt: now,
        });

        await createdRefund.save({ session });

        orderDoc.paymentStatus =
          toPaise(refundAmount) >= toPaise(orderDoc.totalAmount)
            ? "Refunded"
            : "PartiallyRefunded";
        orderDoc.refundStatus = "SUCCESS";
        orderDoc.refundAmount = refundAmount;
        orderDoc.refundRequestedAt = orderDoc.refundRequestedAt || now;
        orderDoc.refundCompletedAt = now;
        orderDoc.refundFailureReason = null;

        await orderDoc.save({ session });
        updatedOrder = orderDoc;
      });
    } finally {
      await session.endSession();
    }

    try {
      await createNotification({
        recipient: updatedOrder.user,
        title: "Refund Completed",
        message: `Your manual refund of ₹${Number(createdRefund.amount).toFixed(2)} for cancelled order ${updatedOrder.orderNumber} has been completed.`,
        type: "REFUND_PROCESSED",
        relatedId: updatedOrder._id,
        relatedModel: "Order",
      });
    } catch (notifyErr) {
      console.error("Manual refund notification error:", notifyErr.message);
    }

    return {
      alreadyProcessed: false,
      refund: createdRefund,
      payment: null,
      order: updatedOrder,
    };
  }

  // Online payment flow via Razorpay.
  if (provider === "Manual") {
    throw createError(
      "Online Razorpay orders must be refunded through Razorpay",
      400,
    );
  }

  if (!payment) {
    payment = await Payment.findOne({
      order: order._id,
      status: {
        $in: ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"],
      },
    }).sort({ createdAt: -1 });
  }

  if (!payment) {
    throw createError("Captured online payment not found for this order", 404);
  }

  if (payment.status === "Refunded" && toPaise(payment.refundedAmount) >= toPaise(payment.amount)) {
    const existingProcessed = await PaymentRefund.findOne({
      referenceType: "OrderCancellation",
      referenceId: order._id,
      status: "Processed",
    }).sort({ attempt: -1 });

    if (order.paymentStatus !== "Refunded" || order.refundStatus !== "SUCCESS") {
      order.paymentStatus = "Refunded";
      order.refundStatus = "SUCCESS";
      order.refundAmount = payment.refundedAmount || payment.amount;
      order.refundCompletedAt = order.refundCompletedAt || payment.refundedAt || new Date();
      await order.save();
    }

    return {
      alreadyProcessed: true,
      refund: existingProcessed,
      payment: sanitizePaymentForCustomer(payment),
      order,
    };
  }

  // If a prior attempt is Processing / Pending / Uncertain, reconcile with Razorpay first.
  const latestRefund = await PaymentRefund.findOne({
    referenceType: "OrderCancellation",
    referenceId: order._id,
  }).sort({ attempt: -1 });

  if (
    latestRefund &&
    ["Pending", "Processing"].includes(latestRefund.status)
  ) {
    const synced = await syncOrderCancellationRefund(order._id, { adminId });

    if (synced.refund?.status === "Processed") {
      return {
        alreadyProcessed: true,
        refund: synced.refund,
        payment: synced.payment,
        order: synced.order,
      };
    }

    if (synced.refund?.status === "Processing") {
      throw createError(
        "Refund is currently processing with Razorpay. Please wait for gateway confirmation.",
        409,
      );
    }

    // Reload payment/order after confirmed failure/absent resolution so we can create attempt + 1 cleanly.
    payment = await Payment.findById(payment._id);
    order = await Order.findById(order._id);
  }

  const session = await mongoose.startSession();
  let reservationResult;

  try {
    await session.withTransaction(async () => {
      const txOrder = await Order.findById(order._id).session(session);
      const txPayment = await Payment.findById(payment._id).session(session);

      reservationResult = await reserveCancellationRefundInSession({
        order: txOrder,
        payment: txPayment,
        userId: adminId,
        initiatedByRole,
        reason:
          reason || txOrder.cancellationReason || "Order cancellation refund",
        amount,
        session,
      });
    });
  } finally {
    await session.endSession();
  }

  if (reservationResult?.alreadyFullyRefunded) {
    return {
      alreadyProcessed: true,
      refund: latestRefund,
      payment: sanitizePaymentForCustomer(reservationResult.payment),
      order: reservationResult.order,
    };
  }

  const executed = await executeReservedRazorpayRefund({
    paymentRefund: reservationResult.paymentRefund,
    payment: reservationResult.payment,
    order: reservationResult.order,
    swallowGatewayError,
  });

  return {
    alreadyProcessed: false,
    refund: executed.paymentRefund,
    payment: sanitizePaymentForCustomer(executed.payment),
    order: executed.order,
  };
};

export const refundPayment = async (
  paymentId = null,
  reason = "Customer refund",
  options = {},
) => {
  return initiateOrderCancellationRefund({
    orderId: options.orderId || null,
    paymentId,
    adminId: options.adminId || null,
    reason,
    amount: options.amount ?? null,
    provider: options.provider || null,
    manualRefundConfirmed: Boolean(options.manualRefundConfirmed),
    initiatedByRole: options.initiatedByRole || "ADMIN",
    swallowGatewayError: Boolean(options.swallowGatewayError),
  });
};

export const getAdminOrderPaymentDetails = async (orderId) => {
  const order = await Order.findById(orderId).lean();

  if (!order) {
    throw createError("Order not found", 404);
  }

  const payments = await Payment.find({ order: order._id })
    .select("-signature -__v")
    .sort({ createdAt: -1 })
    .lean();

  const primaryPayment =
    payments.find((p) =>
      ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"].includes(
        p.status,
      ),
    ) ||
    payments[0] ||
    null;

  const refundHistory = await PaymentRefund.find({ order: order._id })
    .sort({ createdAt: -1 })
    .lean();

  const refundSummary = buildRefundSummary({
    order,
    payment: primaryPayment,
    refunds: refundHistory,
  });

  const paymentDetails = primaryPayment
    ? {
        _id: primaryPayment._id,
        provider: primaryPayment.provider,
        razorpayOrderId: primaryPayment.razorpayOrderId || null,
        razorpayPaymentId: primaryPayment.razorpayPaymentId || null,
        amount: primaryPayment.amount,
        currency: primaryPayment.currency,
        status: primaryPayment.status,
        paymentMethod: primaryPayment.paymentMethod || null,
        verifiedAt: primaryPayment.verifiedAt || null,
        failureReason: primaryPayment.failureReason || null,
        refundedAmount: Number(primaryPayment.refundedAmount || 0),
        reservedRefundAmount: Number(primaryPayment.reservedRefundAmount || 0),
        remainingRefundableAmount: fromPaise(
          Math.max(
            0,
            toPaise(primaryPayment.amount) -
              toPaise(primaryPayment.refundedAmount) -
              toPaise(primaryPayment.reservedRefundAmount),
          ),
        ),
        refundReconciliationRequired: Boolean(
          primaryPayment.refundReconciliationRequired,
        ),
        refundReconciliationReason:
          primaryPayment.refundReconciliationReason || null,
        refundReconciliationAt: primaryPayment.refundReconciliationAt || null,
        refundId: primaryPayment.refundId || null,
        refundedAt: primaryPayment.refundedAt || null,
        createdAt: primaryPayment.createdAt,
      }
    : null;

  return {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    cancellationReason: order.cancellationReason || null,
    cancellationComment: order.cancellationComment || null,
    cancelledBy: order.cancelledBy || null,
    cancelledAt: order.cancelledAt || null,
    paymentDetails,
    refundSummary,
    refundHistory,
  };
};

export const getAdminPaymentsList = async ({
  page = 1,
  limit = 10,
  status = "",
  search = "",
} = {}) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (currentPage - 1) * perPage;

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  if (search && String(search).trim()) {
    const escaped = String(search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = { $regex: escaped, $options: "i" };

    const [matchingOrders, matchingUsers] = await Promise.all([
      Order.find({ orderNumber: regex }).distinct("_id"),
      User.find({ $or: [{ name: regex }, { email: regex }] }).distinct("_id"),
    ]);

    filter.$or = [
      { razorpayPaymentId: regex },
      { razorpayOrderId: regex },
      { refundId: regex },
      { order: { $in: matchingOrders } },
      { user: { $in: matchingUsers } },
    ];
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .select("-signature -refundIdempotencyKey -__v")
      .populate("user", "name email")
      .populate(
        "order",
        "orderNumber orderStatus paymentMethod paymentStatus totalAmount refundStatus",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

export const getAdminRefundsList = async ({
  page = 1,
  limit = 10,
  status = "",
  provider = "",
  referenceType = "",
  search = "",
} = {}) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (currentPage - 1) * perPage;

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (provider && provider !== "all") {
    filter.provider = provider;
  }
  if (referenceType && referenceType !== "all") {
    filter.referenceType = referenceType;
  }

  if (search && String(search).trim()) {
    const escaped = String(search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = { $regex: escaped, $options: "i" };

    const [matchingOrders, matchingUsers] = await Promise.all([
      Order.find({ orderNumber: regex }).distinct("_id"),
      User.find({ $or: [{ name: regex }, { email: regex }] }).distinct("_id"),
    ]);

    filter.$or = [
      { providerRefundId: regex },
      { reason: regex },
      { order: { $in: matchingOrders } },
      { user: { $in: matchingUsers } },
    ];
  }

  const [refunds, total] = await Promise.all([
    PaymentRefund.find(filter)
      .populate("user", "name email")
      .populate(
        "order",
        "orderNumber orderStatus paymentMethod paymentStatus refundStatus totalAmount cancellationReason cancelledAt",
      )
      .populate(
        "payment",
        "razorpayPaymentId razorpayOrderId status refundReconciliationRequired refundReconciliationReason",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    PaymentRefund.countDocuments(filter),
  ]);

  return {
    refunds,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};
