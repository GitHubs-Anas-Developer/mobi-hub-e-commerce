import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Return from "../models/return.model.js";
import { createError } from "../utils/createError.js";
import { updateVariantStock } from "./inventory.service.js";
import Payment from "../models/payment.model.js";
import PaymentRefund from "../models/payment-refund.model.js";
import razorpay from "../config/razorpay.js";
import { createNotification } from "./notification.service.js";


const RETURN_WINDOW_DAYS = 7;

const RESERVED_RETURN_STATUSES = [
  "Requested",
  "Approved",
  "ProductReceived",
  "InspectionPassed",
  "RefundProcessing",
  "Refunded",
];

const roundMoney = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

const generateReturnNumber = () => {
  const randomCode = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `RET-${Date.now()}-${randomCode}`;
};

const getItemKey = (productId, variantId) =>
  `${productId.toString()}_${variantId.toString()}`;

export const requestReturn = async (userId, data) => {
  const { orderId, reason, description = "", items } = data;

  // 1. Validate IDs.
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(orderId)) {
    throw createError("Invalid user or order ID", 400);
  }

  // 2. Validate items.
  if (!Array.isArray(items) || items.length === 0) {
    throw createError("At least one return item is required", 400);
  }

  // 3. Prevent duplicate product + variant entries.
  const requestedKeys = new Set();

  for (const item of items) {
    if (
      !mongoose.isValidObjectId(item.productId) ||
      !mongoose.isValidObjectId(item.variantId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw createError("Invalid return item details", 400);
    }

    const key = getItemKey(item.productId, item.variantId);

    if (requestedKeys.has(key)) {
      throw createError("Duplicate return items are not allowed", 400);
    }

    requestedKeys.add(key);
  }

  const session = await mongoose.startSession();

  let createdReturn = null;

  try {
    await session.withTransaction(async () => {
      // 4. Find customer's order.
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
      }).session(session);

      if (!order) {
        throw createError("Order not found", 404);
      }

      // 5. Validate delivery status.
      if (order.orderStatus !== "Delivered") {
        throw createError("Only delivered orders can be returned", 400);
      }

      if (!order.deliveredAt) {
        throw createError("Order delivery date is unavailable", 400);
      }

      // 6. Validate 7-day return window.
      const returnDeadline =
        new Date(order.deliveredAt).getTime() +
        RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;

      if (Date.now() > returnDeadline) {
        throw createError("The 7-day return window has expired", 400);
      }

      // 7. Atomically increment version.
      // Supports both old orders without returnRequestVersion
      // and new orders with returnRequestVersion.
      const currentVersion = order.returnRequestVersion ?? 0;

      const versionFilter =
        currentVersion === 0
          ? {
              $or: [
                { returnRequestVersion: 0 },
                { returnRequestVersion: { $exists: false } },
              ],
            }
          : {
              returnRequestVersion: currentVersion,
            };

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          ...versionFilter,
        },
        {
          $inc: { returnRequestVersion: 1 },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedOrder) {
        throw createError(
          "Order was updated by another request. Please try again",
          409,
        );
      }

      // 8. Get previous returns that reserve quantities.
      const previousReturns = await Return.find({
        order: order._id,
        status: { $in: RESERVED_RETURN_STATUSES },
      })
        .select("items")
        .session(session)
        .lean();

      const previouslyRequested = new Map();

      for (const previousReturn of previousReturns) {
        for (const previousItem of previousReturn.items) {
          const key = getItemKey(previousItem.product, previousItem.variantId);

          const currentQuantity = previouslyRequested.get(key) || 0;

          previouslyRequested.set(
            key,
            currentQuantity + previousItem.returnQuantity,
          );
        }
      }

      // 9. Calculate refund amount and prepare return items.
      const returnItems = [];
      let totalRefundAmount = 0;

      const orderSubtotal = Number(order.subtotal || 0);
      const orderDiscount = Number(order.discount || 0);

      for (const requestedItem of items) {
        const orderItem = order.items.find(
          (item) =>
            item.product.toString() === requestedItem.productId &&
            item.variantId.toString() === requestedItem.variantId,
        );

        if (!orderItem) {
          throw createError(
            "Product or variant does not belong to this order",
            400,
          );
        }

        const key = getItemKey(
          requestedItem.productId,
          requestedItem.variantId,
        );

        const alreadyRequested = previouslyRequested.get(key) || 0;

        const availableQuantity = orderItem.quantity - alreadyRequested;

        if (requestedItem.quantity > availableQuantity) {
          throw createError(
            `Only ${Math.max(availableQuantity, 0)} quantity available for return`,
            400,
          );
        }

        // 10. Calculate original item subtotal.
        const itemSubtotal = Number(
          orderItem.subtotal || orderItem.sellingPrice * orderItem.quantity,
        );

        const unitPrice = Number(orderItem.sellingPrice);

        if (
          !Number.isFinite(itemSubtotal) ||
          !Number.isFinite(unitPrice) ||
          itemSubtotal <= 0 ||
          unitPrice <= 0
        ) {
          throw createError("Invalid order item pricing", 400);
        }

        // 11. Proportional coupon discount allocation.
        const itemDiscount =
          orderSubtotal > 0
            ? (orderDiscount * itemSubtotal) / orderSubtotal
            : 0;

        const allocatedDiscount = roundMoney(
          itemDiscount * (requestedItem.quantity / orderItem.quantity),
        );

        // 12. Calculate refund amount.
        const refundAmount = roundMoney(
          unitPrice * requestedItem.quantity - allocatedDiscount,
        );

        if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
          throw createError("Invalid refund amount", 400);
        }

        returnItems.push({
          product: orderItem.product,
          productName: orderItem.productName,
          slug: orderItem.slug,
          thumbnail: orderItem.thumbnail || "",
          variantId: orderItem.variantId,
          sku: orderItem.sku,
          attributes: orderItem.attributes || {},
          orderedQuantity: orderItem.quantity,
          returnQuantity: requestedItem.quantity,
          unitPrice,
          allocatedDiscount,
          refundAmount,
        });

        totalRefundAmount = roundMoney(totalRefundAmount + refundAmount);
      }

      // 13. Determine refund method.
      const refundMethod =
        order.paymentMethod === "Online" ? "Razorpay" : "Manual";

      // 14. Create return request.
      const [newReturn] = await Return.create(
        [
          {
            returnNumber: generateReturnNumber(),
            order: order._id,
            user: order.user,
            items: returnItems,
            reason,
            description,
            status: "Requested",
            refundAmount: totalRefundAmount,
            refundMethod,
          },
        ],
        { session },
      );

      createdReturn = newReturn;
    });

    return createdReturn;
  } finally {
    await session.endSession();
  }
};

export const getAdminReturns = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

  const filter = {};

  // Optional status filter.
  if (query.status) {
    const allowedStatuses = [
      "Requested",
      "Approved",
      "Rejected",
      "ProductReceived",
      "InspectionPassed",
      "InspectionFailed",
      "RefundProcessing",
      "Refunded",
    ];

    if (!allowedStatuses.includes(query.status)) {
      throw createError("Invalid return status", 400);
    }

    filter.status = query.status;
  }

  const skip = (page - 1) * limit;

  const [returns, total] = await Promise.all([
    Return.find(filter)
      .populate("user", "name email")
      .populate("order", "orderStatus paymentMethod paymentStatus totalAmount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Return.countDocuments(filter),
  ]);

  return {
    returns,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const reviewReturnRequest = async (returnId, adminId, data) => {
  const { status, adminNote = "" } = data;

  if (!mongoose.isValidObjectId(returnId)) {
    throw createError("Invalid return ID", 400);
  }

  if (!mongoose.isValidObjectId(adminId)) {
    throw createError("Invalid admin ID", 400);
  }

  if (!["Approved", "Rejected"].includes(status)) {
    throw createError("Invalid return review status", 400);
  }

  const updatedReturn = await Return.findOneAndUpdate(
    {
      _id: returnId,
      status: "Requested",
    },
    {
      $set: {
        status,
        adminNote,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedReturn) {
    const existingReturn = await Return.findById(returnId).select("status");

    if (!existingReturn) {
      throw createError("Return request not found", 404);
    }

    throw createError(
      `Return request cannot be reviewed because its current status is ${existingReturn.status}`,
      409,
    );
  }

  return updatedReturn;
};

export const markReturnProductReceived = async (returnId) => {
  if (!mongoose.isValidObjectId(returnId)) {
    throw createError("Invalid return ID", 400);
  }

  const updatedReturn = await Return.findOneAndUpdate(
    {
      _id: returnId,
      status: "Approved",
    },
    {
      $set: {
        status: "ProductReceived",
        receivedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedReturn) {
    const existingReturn = await Return.findById(returnId).select("status");

    if (!existingReturn) {
      throw createError("Return request not found", 404);
    }

    throw createError(
      `Product cannot be marked as received because current status is ${existingReturn.status}`,
      409,
    );
  }

  return updatedReturn;
};

export const inspectReturnProduct = async (returnId, adminId, data) => {
  const { status, adminNote = "" } = data;

  if (!mongoose.isValidObjectId(returnId)) {
    throw createError("Invalid return ID", 400);
  }

  if (!mongoose.isValidObjectId(adminId)) {
    throw createError("Invalid admin ID", 400);
  }

  if (!["InspectionPassed", "InspectionFailed"].includes(status)) {
    throw createError("Invalid inspection status", 400);
  }

  const updateFields = {
    status,
    inspectedAt: new Date(),
  };

  // Preserve the previous note when no new note is provided.
  if (adminNote.trim()) {
    updateFields.adminNote = adminNote.trim();
  }

  const updatedReturn = await Return.findOneAndUpdate(
    {
      _id: returnId,
      status: "ProductReceived",
    },
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedReturn) {
    const existingReturn = await Return.findById(returnId).select("status");

    if (!existingReturn) {
      throw createError("Return request not found", 404);
    }

    throw createError(
      `Return product cannot be inspected because its current status is ${existingReturn.status}`,
      409,
    );
  }

  return updatedReturn;
};

export const restoreReturnStock = async (returnId, adminId) => {
  if (!mongoose.isValidObjectId(returnId)) {
    throw createError("Invalid return ID", 400);
  }

  if (!mongoose.isValidObjectId(adminId)) {
    throw createError("Invalid admin ID", 400);
  }

  const session = await mongoose.startSession();

  let updatedReturn;

  try {
    await session.withTransaction(async () => {
      const returnRequest = await Return.findOne({
        _id: returnId,
        status: "InspectionPassed",
      }).session(session);

      if (!returnRequest) {
        const existingReturn = await Return.findById(returnId)
          .select("status stockRestoredAt")
          .session(session);

        if (!existingReturn) {
          throw createError("Return request not found", 404);
        }

        if (existingReturn.stockRestoredAt) {
          throw createError("Return stock has already been restored", 409);
        }

        throw createError(
          `Stock cannot be restored because current return status is ${existingReturn.status}`,
          409,
        );
      }

      // Prevent duplicate stock restoration.
      if (returnRequest.stockRestoredAt) {
        throw createError("Return stock has already been restored", 409);
      }

      // Restore stock for every returned item.
      for (const item of returnRequest.items) {
        await updateVariantStock({
          productId: item.product,
          variantId: item.variantId,
          quantity: item.returnQuantity,
          direction: "IN",
          type: "Return",
          referenceType: "Return",
          referenceId: returnRequest._id,
          performedBy: adminId,
          note: `Stock restored for return ${returnRequest.returnNumber}`,
          idempotencyKey: `return:${returnRequest._id}:${item.product}:${item.variantId}`,
          session,
        });
      }

      // Mark stock restoration inside the same transaction.
      returnRequest.stockRestoredAt = new Date();

      await returnRequest.save({ session });

      updatedReturn = returnRequest;
    });

    return updatedReturn;
  } finally {
    await session.endSession();
  }
};

export const processReturnRefund = async (returnId, adminId, data = {}) => {
  if (
    !mongoose.isValidObjectId(returnId) ||
    !mongoose.isValidObjectId(adminId)
  ) {
    throw createError("Invalid return or admin ID", 400);
  }

  // 1. Find return request.
  const initialReturn = await Return.findOne({
    _id: returnId,
    status: { $in: ["InspectionPassed", "RefundProcessing"] },
  });

  if (!initialReturn) {
    const existing = await Return.findById(returnId).select("status");

    if (!existing) {
      throw createError("Return request not found", 404);
    }

    throw createError(
      `Refund cannot be processed because current status is ${existing.status}`,
      409,
    );
  }

  if (!initialReturn.stockRestoredAt) {
    throw createError(
      "Restore returned product stock before processing refund",
      409,
    );
  }

  const isOnline = initialReturn.refundMethod === "Razorpay";
  const isManual = initialReturn.refundMethod === "Manual";

  if (!isOnline && !isManual) {
    throw createError("Unsupported refund method", 400);
  }

  const refundAmount = Number(Number(initialReturn.refundAmount).toFixed(2));

  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    throw createError("Invalid refund amount", 400);
  }

  if (isManual && data.manualRefundConfirmed !== true) {
    throw createError(
      "Confirm that the manual refund has actually been transferred",
      400,
    );
  }

  // 2. Get order.
  const order = await Order.findById(initialReturn.order);

  if (!order) {
    throw createError("Order not found", 404);
  }

  let payment = null;

  // 3. Verify captured Razorpay payment.
  if (isOnline) {
    payment = await Payment.findOne({
      order: order._id,
      user: initialReturn.user,
      status: { $in: ["Paid", "PartiallyRefunded"] },
    });

    if (!payment || !payment.razorpayPaymentId) {
      throw createError(
        "A captured Razorpay payment was not found for this order",
        409,
      );
    }

    // Block refunds requiring manual reconciliation.
    if (payment.refundReconciliationRequired) {
      throw createError(
        "Refund requires manual reconciliation. New refund attempts are blocked.",
        409,
      );
    }

    const razorpayPayment = await razorpay.payments.fetch(
      payment.razorpayPaymentId,
    );

    if (
      razorpayPayment.status !== "captured" ||
      razorpayPayment.amount !== Math.round(payment.amount * 100) ||
      razorpayPayment.currency?.toUpperCase() !==
        payment.currency?.toUpperCase()
    ) {
      throw createError("Razorpay captured payment verification failed", 409);
    }
  }

  // 4. Find previous refund attempt.
  const previousAttempt = await PaymentRefund.findOne({
    referenceType: "Return",
    referenceId: initialReturn._id,
  }).sort({ attempt: -1 });

  // Manual refunds must not be duplicated.
  if (isManual && previousAttempt) {
    throw createError("A refund attempt already exists for this return", 409);
  }

  // 5. Verify previous Razorpay refund before allowing retry.
  if (isOnline && previousAttempt) {
    if (previousAttempt.provider !== "Razorpay") {
      throw createError("Previous refund provider mismatch", 409);
    }

    if (!previousAttempt.providerRefundId) {
      throw createError(
        "Previous refund has no Razorpay refund ID. Manual verification is required before retrying.",
        409,
      );
    }

    let providerRefund;

    try {
      const response = await fetch(
        `https://api.razorpay.com/v1/refunds/${previousAttempt.providerRefundId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
            ).toString("base64")}`,
          },
        },
      );

      providerRefund = await response.json();

      if (!response.ok) {
        throw new Error(
          providerRefund.error?.description ||
            "Unable to verify Razorpay refund",
        );
      }
    } catch (error) {
      console.error("Previous Razorpay refund verification failed:", error);

      throw createError(
        "Unable to verify previous Razorpay refund status. Retry is blocked.",
        502,
      );
    }

    // Verify provider refund details.
    if (
      providerRefund.id !== previousAttempt.providerRefundId ||
      providerRefund.payment_id !== payment.razorpayPaymentId ||
      providerRefund.amount !== Math.round(previousAttempt.amount * 100) ||
      !["pending", "processed", "failed"].includes(providerRefund.status)
    ) {
      throw createError(
        "Razorpay refund verification mismatch. Retry is blocked.",
        409,
      );
    }

    const checkedAt = new Date();

    // Provider still processing.
    if (providerRefund.status === "pending") {
      if (previousAttempt.status === "Processed") {
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              refundReconciliationRequired: true,
              refundReconciliationReason:
                "Razorpay returned pending for an already processed refund attempt.",
              refundReconciliationAt: checkedAt,
            },
          },
        );

        throw createError(
          "Refund status mismatch. Manual reconciliation is required.",
          409,
        );
      }

      if (previousAttempt.status === "Failed") {
        throw createError(
          "Previous refund is locally marked failed but Razorpay reports pending. Manual reconciliation is required.",
          409,
        );
      }

      await PaymentRefund.updateOne(
        { _id: previousAttempt._id },
        {
          $set: {
            providerStatus: "pending",
            providerStatusCheckedAt: checkedAt,
          },
        },
      );

      throw createError(
        "Previous Razorpay refund is still pending. Wait before retrying.",
        409,
      );
    }

    // Provider already processed the refund.
    if (providerRefund.status === "processed") {
      await PaymentRefund.updateOne(
        { _id: previousAttempt._id },
        {
          $set: {
            providerStatus: "processed",
            providerStatusCheckedAt: checkedAt,
          },
        },
      );

      throw createError(
        "Previous Razorpay refund has been processed. Do not retry. Wait for refund reconciliation.",
        409,
      );
    }

    // Only provider-confirmed failure can release the reservation.
    if (providerRefund.status === "failed") {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const oldRefund = await PaymentRefund.findById(
            previousAttempt._id,
          ).session(session);

          if (!oldRefund) {
            throw createError("Previous refund record not found", 404);
          }

          if (
            oldRefund.providerRefundId !== providerRefund.id ||
            !oldRefund.payment ||
            oldRefund.payment.toString() !== payment._id.toString()
          ) {
            throw createError(
              "Previous refund record verification failed",
              409,
            );
          }

          // Never downgrade an already processed refund.
          if (oldRefund.status === "Processed") {
            throw createError(
              "This refund is already processed and cannot be retried.",
              409,
            );
          }

          // Release reservation exactly once.
          if (!oldRefund.reservationReleasedAt) {
            const releasedPayment = await Payment.findOneAndUpdate(
              {
                _id: payment._id,
                reservedRefundAmount: {
                  $gte: oldRefund.amount,
                },
              },
              {
                $inc: {
                  reservedRefundAmount: -oldRefund.amount,
                },
              },
              {
                new: true,
                session,
              },
            );

            if (!releasedPayment) {
              throw createError(
                "Unable to safely release previous refund reservation",
                409,
              );
            }

            oldRefund.reservationReleasedAt = checkedAt;
          }

          oldRefund.status = "Failed";
          oldRefund.providerStatus = "failed";
          oldRefund.providerStatusCheckedAt = checkedAt;
          oldRefund.failureReason =
            providerRefund.error_description ||
            "Razorpay confirmed refund failure";

          await oldRefund.save({ session });

          // Reset only if this old attempt still owns the Return.
          const returnRequest =
            await Return.findById(returnId).session(session);

          if (
            returnRequest?.status === "RefundProcessing" &&
            returnRequest.paymentRefund?.toString() === oldRefund._id.toString()
          ) {
            returnRequest.status = "InspectionPassed";
            await returnRequest.save({ session });
          }
        });
      } finally {
        await session.endSession();
      }
    }
  }

  // 6. Create the next refund attempt.
  const session = await mongoose.startSession();

  let paymentRefund;
  let attempt;

  try {
    await session.withTransaction(async () => {
      const returnRequest = await Return.findOne({
        _id: returnId,
        status: "InspectionPassed",
      }).session(session);

      if (!returnRequest) {
        throw createError("Return is not ready for refund processing", 409);
      }

      if (!returnRequest.stockRestoredAt) {
        throw createError(
          "Restore returned product stock before processing refund",
          409,
        );
      }

      const latestAttempt = await PaymentRefund.findOne({
        referenceType: "Return",
        referenceId: returnRequest._id,
      })
        .sort({ attempt: -1 })
        .session(session);

      // Do not allow an unverified previous attempt.
      if (
        latestAttempt &&
        (latestAttempt.status !== "Failed" ||
          latestAttempt.providerStatus !== "failed" ||
          !latestAttempt.reservationReleasedAt)
      ) {
        throw createError(
          "Previous refund attempt has not been safely resolved",
          409,
        );
      }

      attempt = latestAttempt ? latestAttempt.attempt + 1 : 1;

      // ------------------------------------
      // MANUAL REFUND
      // ------------------------------------
      if (isManual) {
        paymentRefund = new PaymentRefund({
          payment: null,
          order: returnRequest.order,
          user: returnRequest.user,
          referenceType: "Return",
          referenceId: returnRequest._id,
          attempt,
          provider: "Manual",
          amount: refundAmount,
          currency: "INR",
          status: "Processed",
          idempotencyKey: `return-${returnRequest._id}-attempt-${attempt}`,
          reason:
            data.reason ||
            `Manual refund for return ${returnRequest.returnNumber}`,
          processedAt: new Date(),
        });

        await paymentRefund.save({ session });

        returnRequest.paymentRefund = paymentRefund._id;
        returnRequest.status = "Refunded";
        returnRequest.refundedAt = new Date();
        returnRequest.refundProcessedAt = new Date();

        await returnRequest.save({ session });

        return;
      }

      // ------------------------------------
      // RAZORPAY REFUND
      // ------------------------------------
      const currentPayment = await Payment.findOne({
        _id: payment._id,
        order: returnRequest.order,
        user: returnRequest.user,
        status: { $in: ["Paid", "PartiallyRefunded"] },
      }).session(session);

      if (!currentPayment) {
        throw createError("Payment is no longer eligible for refund", 409);
      }

      // Recheck reconciliation flag inside transaction.
      if (currentPayment.refundReconciliationRequired) {
        throw createError(
          "Refund requires manual reconciliation. New refund attempts are blocked.",
          409,
        );
      }

      // Reserve the refund amount atomically.
      const reservedPayment = await Payment.findOneAndUpdate(
        {
          _id: currentPayment._id,
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
              "$amount",
            ],
          },
        },
        {
          $inc: {
            reservedRefundAmount: refundAmount,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!reservedPayment) {
        throw createError(
          "Refund amount exceeds the remaining refundable payment balance or reconciliation is required",
          409,
        );
      }

      paymentRefund = new PaymentRefund({
        payment: reservedPayment._id,
        order: returnRequest.order,
        user: returnRequest.user,
        referenceType: "Return",
        referenceId: returnRequest._id,
        attempt,
        provider: "Razorpay",
        amount: refundAmount,
        currency: reservedPayment.currency,
        status: "Pending",
        idempotencyKey: `return-${returnRequest._id}-attempt-${attempt}`,
        reason:
          data.reason || `Refund for return ${returnRequest.returnNumber}`,
      });

      await paymentRefund.save({ session });

      returnRequest.paymentRefund = paymentRefund._id;
      returnRequest.status = "RefundProcessing";

      await returnRequest.save({ session });
    });
  } finally {
    await session.endSession();
  }

  // 7. Manual refund completed.
  if (isManual) {
    try {
      await createNotification({
        recipient: initialReturn.user,
        title: "Return Refund Completed",
        message: `Your manual refund for return ${initialReturn.returnNumber} has been processed.`,
        type: "REFUND_SUCCESS",
        relatedId: initialReturn._id,
        relatedModel: "Return",
      });
    } catch (error) {
      console.error("Manual refund notification error:", error.message);
    }

    return await Return.findById(returnId).populate("paymentRefund");
  }

  // 8. Submit Razorpay refund.
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${payment.razorpayPaymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
        ).toString("base64")}`,
        "Content-Type": "application/json",
        "X-Refund-Idempotency": paymentRefund.idempotencyKey,
      },
      body: JSON.stringify({
        amount: Math.round(refundAmount * 100),
        notes: {
          reason: paymentRefund.reason,
          orderId: order._id.toString(),
          returnId: returnId.toString(),
          attempt: String(attempt),
        },
      }),
    },
  );

  let refundData;

  try {
    refundData = await response.json();
  } catch {
    throw createError(
      "Invalid Razorpay response. Check refund status before retrying.",
      502,
    );
  }

  if (!response.ok || !refundData.id) {
    console.error("Razorpay Return Refund Error:", {
      status: response.status,
      description: refundData.error?.description,
      code: refundData.error?.code,
    });

    throw createError(
      refundData.error?.description ||
        "Razorpay refund request failed. Check Razorpay before retrying.",
      response.status || 502,
    );
  }

  // 9. Save Razorpay refund ID and provider status.
  const updatedRefund = await PaymentRefund.findOneAndUpdate(
    {
      _id: paymentRefund._id,
      status: "Pending",
    },
    {
      $set: {
        status: "Processing",
        providerRefundId: refundData.id,
        providerStatus: refundData.status,
        providerStatusCheckedAt: new Date(),
      },
    },
    {
      new: true,
    },
  );

  if (!updatedRefund) {
    throw createError(
      "Refund was submitted but its record could not be updated. Check Razorpay before retrying.",
      409,
    );
  }

  return {
    returnId,
    paymentRefund: updatedRefund,
    razorpayRefundStatus: refundData.status,
  };
};
