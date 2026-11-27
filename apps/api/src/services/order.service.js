import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Coupon from "../models/coupon.model.js";
import CouponUsage from "../models/coupon-usage.model.js";
import { updateVariantStock } from "./inventory.service.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.service.js";
import sendEmail from "./email.service.js";
import orderConfirmationTemplate from "../templates/emails/order-confirmation.template.js";
import adminNewOrderTemplate from "../templates/emails/admin-new-order.template.js";
import orderStatusTemplate from "../templates/emails/order-status.template.js";
import { createShiprocketOrder } from "./shiprocket.service.js";
import shiprocketConfig from "../config/shiprocket.config.js";
import Payment from "../models/payment.model.js";
import PaymentRefund from "../models/payment-refund.model.js";
import {
  buildRefundSummary,
  executeReservedRazorpayRefund,
  reserveCancellationRefundInSession,
  sanitizePaymentForCustomer,
} from "./payment.service.js";

const DISPATCHED_SHIPMENT_STATUSES = new Set([
  "PICKUP SCHEDULED",
  "PICKED UP",
  "IN TRANSIT",
  "OUT FOR DELIVERY",
  "DELIVERED",
]);

export const isOrderCancellable = (order) => {
  if (!order) {
    return { cancellable: false, reason: "Order not found" };
  }

  if (order.orderStatus === "Cancelled") {
    return { cancellable: false, reason: "Order is already cancelled" };
  }

  if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
    return {
      cancellable: false,
      reason: `This order cannot be cancelled at ${order.orderStatus} stage`,
    };
  }

  const shipmentStatus = String(order.shipment?.currentStatus || "")
    .trim()
    .toUpperCase();

  if (
    order.shipment?.shippedAt ||
    order.shipment?.pickupScheduledAt ||
    order.shipment?.deliveredAt ||
    order.shipment?.awbCode ||
    DISPATCHED_SHIPMENT_STATUSES.has(shipmentStatus)
  ) {
    return {
      cancellable: false,
      reason:
        "Order cannot be cancelled after courier pickup has been scheduled or shipped",
    };
  }

  return { cancellable: true, reason: null };
};

const attachCustomerOrderSummaries = async (orders = []) => {
  if (!Array.isArray(orders) || orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((order) => order._id);

  const [payments, refunds] = await Promise.all([
    Payment.find({ order: { $in: orderIds } })
      .sort({ createdAt: -1 })
      .lean(),
    PaymentRefund.find({ order: { $in: orderIds } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const paymentsByOrder = new Map();
  for (const payment of payments) {
    const key = payment.order.toString();
    const list = paymentsByOrder.get(key) || [];
    list.push(payment);
    paymentsByOrder.set(key, list);
  }

  const refundsByOrder = new Map();
  for (const refund of refunds) {
    const key = refund.order.toString();
    const list = refundsByOrder.get(key) || [];
    list.push(refund);
    refundsByOrder.set(key, list);
  }

  return orders.map((order) => {
    const key = order._id.toString();
    const orderPayments = paymentsByOrder.get(key) || [];
    const primaryPayment =
      orderPayments.find((p) =>
        ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"].includes(
          p.status,
        ),
      ) ||
      orderPayments[0] ||
      null;
    const orderRefunds = refundsByOrder.get(key) || [];
    const eligibility = isOrderCancellable(order);

    return {
      ...order,
      cancellable: eligibility.cancellable,
      cancelIneligibleReason: eligibility.reason,
      paymentSummary: primaryPayment
        ? sanitizePaymentForCustomer(primaryPayment)
        : null,
      refundSummary: buildRefundSummary({
        order,
        payment: primaryPayment,
        refunds: orderRefunds,
      }),
    };
  });
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateOrderNumber = () => {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `MH-${Date.now()}-${randomPart}`;
};

const sendOrderNotifications = async ({
  customerId,
  order,
  type,
  title,
  message,
  notifyAdmins = false,
}) => {
  try {
    const notifications = [
      createNotification({
        recipient: customerId,
        title,
        message,
        type,
        relatedId: order._id,
        relatedModel: "Order",
      }),
    ];

    if (notifyAdmins) {
      const admins = await User.find({
        role: "admin",
        isActive: true,
      })
        .select("_id")
        .lean();

      for (const admin of admins) {
        notifications.push(
          createNotification({
            recipient: admin._id,
            title: "New Order Received",
            message: `New order ${order.orderNumber} has been placed.`,
            type,
            relatedId: order._id,
            relatedModel: "Order",
          }),
        );
      }
    }

    const results = await Promise.allSettled(notifications);

    const failedCount = results.filter(
      (result) => result.status === "rejected",
    ).length;

    if (failedCount > 0) {
      console.error(`Failed to create ${failedCount} order notification(s)`);
    }
  } catch (error) {
    console.error("Order notification error:", error.message);
  }
};

const sendOrderConfirmationEmail = async (order, userId) => {
  try {
    const user = await User.findById(userId).select("name email").lean();

    if (!user?.email) {
      console.warn(
        `Order confirmation skipped: customer email not found for ${order.orderNumber}`,
      );
      return;
    }

    await sendEmail({
      to: user.email,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: orderConfirmationTemplate(order),
      text: [
        `Hello ${order.shippingAddress.fullName},`,
        `Your ELENZO order ${order.orderNumber} has been confirmed.`,
        `Total: INR ${order.totalAmount}`,
        "Thank you for shopping with ELENZO.",
      ].join("\n"),
    });

    console.log(`Order confirmation email sent: ${order.orderNumber}`);
  } catch (error) {
    console.error(
      `Order confirmation email failed for ${order.orderNumber}:`,
      error.message,
    );
  }
};

const sendAdminNewOrderEmail = async (order, userId) => {
  try {
    const [customer, adminEmail] = await Promise.all([
      User.findById(userId).select("name email").lean(),
      Promise.resolve(process.env.ADMIN_EMAIL),
    ]);

    if (!adminEmail) {
      console.warn("Admin order email skipped: ADMIN_EMAIL is missing");
      return;
    }

    if (!customer?.email) {
      console.warn(
        `Admin order email skipped: customer email missing for ${order.orderNumber}`,
      );
      return;
    }

    await sendEmail({
      to: adminEmail,
      subject: `New Order Received - ${order.orderNumber}`,
      html: adminNewOrderTemplate(order, customer),
      text: [
        "New order received - ELENZO",
        `Order Number: ${order.orderNumber}`,
        `Customer: ${order.shippingAddress.fullName}`,
        `Customer Email: ${customer.email}`,
        `Phone: ${order.shippingAddress.phone}`,
        `Total: INR ${order.totalAmount}`,
        `Payment Method: ${order.paymentMethod}`,
      ].join("\n"),
    });

    console.log(`Admin order email sent: ${order.orderNumber}`);
  } catch (error) {
    console.error(
      `Admin order email failed for ${order.orderNumber}:`,
      error.message,
    );
  }
};

const sendOrderStatusEmail = async (order) => {
  console.log("STATUS EMAIL FUNCTION CALLED:", order.orderNumber);

  try {
    const user = await User.findById(order.user).select("name email").lean();

    if (!user?.email) {
      console.warn(
        "STATUS EMAIL SKIPPED: Customer email not found",
        order.orderNumber,
      );
      return;
    }

    const html = orderStatusTemplate(order);

    if (typeof html !== "string" || !html.trim()) {
      throw new Error("Order status email template is empty or invalid");
    }

    const result = await sendEmail({
      to: user.email,
      subject: `ELENZO - Order ${order.orderNumber} ${order.orderStatus}`,
      html,
      text: [
        `Hello ${order.shippingAddress?.fullName || user.name || "Customer"},`,
        `Your order ${order.orderNumber} is now ${order.orderStatus}.`,
        `Total: INR ${order.totalAmount}`,
        "Thank you for shopping with ELENZO.",
      ].join("\n"),
    });

    console.log("STATUS EMAIL SUCCESS:", {
      orderNumber: order.orderNumber,
      email: user.email,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("STATUS EMAIL ERROR:", {
      orderNumber: order.orderNumber,
      error: error.message,
    });
  }
};

export const createOrder = async (userId, data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      addressId,
      paymentMethod,
      couponCode,
      checkoutType = "cart",
      items: directItems,
    } = data;

    const isDirectCheckout = checkoutType === "direct";

    // 1. Validate checkout type
    if (!["cart", "direct"].includes(checkoutType)) {
      throw createError("Invalid checkout type", 400);
    }

    // 2. Validate shipping address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    })
      .session(session)
      .lean();

    if (!address) {
      throw createError("Shipping address not found", 404);
    }

    // 3. Get checkout items
    let cart = null;
    let checkoutItems = [];

    if (isDirectCheckout) {
      if (!Array.isArray(directItems) || directItems.length !== 1) {
        throw createError("Direct checkout requires exactly one product", 400);
      }

      const directItem = directItems[0];

      if (
        !mongoose.isValidObjectId(directItem.productId) ||
        !mongoose.isValidObjectId(directItem.variantId)
      ) {
        throw createError("Invalid product or variant", 400);
      }

      const quantity = Number(directItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw createError("Invalid product quantity", 400);
      }

      checkoutItems = [
        {
          productId: directItem.productId,
          variantId: directItem.variantId,
          quantity,
        },
      ];
    } else {
      // Normal cart checkout
      if (directItems !== undefined) {
        throw createError(
          "Direct checkout items are not allowed for cart checkout",
          400,
        );
      }

      cart = await Cart.findOne({ user: userId }).session(session).populate({
        path: "items.product",
        options: { session },
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        throw createError("Your cart is empty", 400);
      }

      checkoutItems = cart.items;
    }

    // 4. Validate products and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of checkoutItems) {
      const product = isDirectCheckout
        ? await Product.findById(item.productId).session(session)
        : item.product;

      if (!product || !product.isActive) {
        throw createError("A product is unavailable", 400);
      }

      if (!mongoose.isValidObjectId(item.variantId)) {
        throw createError("Invalid product variant", 400);
      }

      const variant = product.variants.id(item.variantId);

      if (!variant || !variant.isActive) {
        throw createError("A product variant is unavailable", 400);
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw createError("Invalid product quantity", 400);
      }

      if (variant.stock < quantity) {
        throw createError(`Insufficient stock for ${product.name}`, 400);
      }

      const itemSubtotal = variant.sellingPrice * quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        slug: product.slug,
        thumbnail: product.thumbnail,
        variantId: variant._id,
        sku: variant.sku,
        attributes: variant.attributes,
        quantity,
        mrp: variant.mrp,
        sellingPrice: variant.sellingPrice,
        subtotal: itemSubtotal,
      });
    }

    // 5. Calculate coupon discount
    let discount = 0;

    const couponSnapshot = {
      couponId: null,
      code: null,
      discountType: null,
      discountValue: null,
      discountAmount: 0,
    };

    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const now = new Date();

      appliedCoupon = await Coupon.findOne({
        code: normalizedCode,
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gte: now },
      }).session(session);

      if (!appliedCoupon) {
        throw createError("Invalid or expired coupon", 400);
      }

      if (
        appliedCoupon.usageLimit !== null &&
        appliedCoupon.usedCount >= appliedCoupon.usageLimit
      ) {
        throw createError("Coupon usage limit reached", 400);
      }

      if (subtotal < appliedCoupon.minOrderAmount) {
        throw createError(
          `Minimum order amount for this coupon is ${appliedCoupon.minOrderAmount}`,
          400,
        );
      }

      // Check per-user usage
      const existingUsage = await CouponUsage.findOne({
        coupon: appliedCoupon._id,
        user: userId,
      }).session(session);

      if (
        existingUsage &&
        existingUsage.usedCount >= appliedCoupon.perUserLimit
      ) {
        throw createError("You have reached this coupon's usage limit", 400);
      }

      // Calculate discount
      if (appliedCoupon.discountType === "Percentage") {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
      } else {
        discount = appliedCoupon.discountValue;
      }

      if (appliedCoupon.maxDiscountAmount !== null) {
        discount = Math.min(discount, appliedCoupon.maxDiscountAmount);
      }

      discount = Math.min(discount, subtotal);
      discount = Math.round(discount * 100) / 100;

      couponSnapshot.couponId = appliedCoupon._id;
      couponSnapshot.code = appliedCoupon.code;
      couponSnapshot.discountType = appliedCoupon.discountType;
      couponSnapshot.discountValue = appliedCoupon.discountValue;
      couponSnapshot.discountAmount = discount;
    }

    // 6. Update coupon usage inside transaction
    if (appliedCoupon) {
      const couponFilter = {
        _id: appliedCoupon._id,
        isActive: true,
      };

      if (appliedCoupon.usageLimit !== null) {
        couponFilter.usedCount = {
          $lt: appliedCoupon.usageLimit,
        };
      }

      const updatedCoupon = await Coupon.findOneAndUpdate(
        couponFilter,
        {
          $inc: { usedCount: 1 },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedCoupon) {
        throw createError("Coupon usage limit reached", 400);
      }

      // Increment per-user usage
      const existingUsage = await CouponUsage.findOne({
        coupon: appliedCoupon._id,
        user: userId,
      }).session(session);

      if (existingUsage) {
        const usageUpdate = await CouponUsage.updateOne(
          {
            _id: existingUsage._id,
            usedCount: { $lt: appliedCoupon.perUserLimit },
          },
          {
            $inc: { usedCount: 1 },
          },
          { session },
        );

        if (usageUpdate.modifiedCount !== 1) {
          throw createError("You have reached this coupon's usage limit", 400);
        }
      } else {
        await CouponUsage.create(
          [
            {
              coupon: appliedCoupon._id,
              user: userId,
              usedCount: 1,
            },
          ],
          { session },
        );
      }
    }

    // 7. Calculate final order amount
    const shippingFee = 0;
    const totalAmount = subtotal + shippingFee - discount;

    // 8. Create order inside transaction
    const [order] = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),
          user: userId,
          items: orderItems,

          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            alternatePhone: address.alternatePhone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
          },

          subtotal,
          shippingFee,
          discount,
          coupon: couponSnapshot,
          totalAmount,
          paymentMethod,

          // Initial order status
          orderStatus: "Pending",

          // Initial order status history
          orderStatusHistory: [
            {
              status: "Pending",
              note: "Order placed successfully",
              changedBy: userId,
              source: "SYSTEM",
              timestamp: new Date(),
            },
          ],
        },
      ],
      { session },
    );

    // 9. Deduct stock and create inventory history
    for (const [index, item] of order.items.entries()) {
      await updateVariantStock({
        productId: item.product,
        variantId: item.variantId,
        quantity: item.quantity,
        direction: "OUT",
        type: "Order",
        referenceType: "Order",
        referenceId: order._id,
        performedBy: userId,
        note: `Stock deducted for order ${order.orderNumber}`,
        idempotencyKey: `order:${order._id}:${index}`,
        requireActive: true,
        session,
      });
    }

    // 10. Clear cart only for normal cart checkout
    if (!isDirectCheckout) {
      cart.items = [];
      await cart.save({ session });
    }

    // 11. Commit transaction
    await session.commitTransaction();

    // 12. Send in-app notifications
    await sendOrderNotifications({
      customerId: userId,
      order,
      type: "ORDER_PLACED",
      title: "Order Placed Successfully",
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      notifyAdmins: true,
    });

    // 13. Send customer order confirmation email
    await sendOrderConfirmationEmail(order, userId);

    // 14. Send admin new order email
    await sendAdminNewOrderEmail(order, userId);

    return order;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getUserOrders = async (userId, query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = { user: userId };

  if (query.status) {
    filter.orderStatus = query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Order.countDocuments(filter),
  ]);

  const enrichedOrders = await attachCustomerOrderSummaries(orders);

  return {
    orders: enrichedOrders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId).select("-__v").lean();

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.user.toString() !== userId.toString()) {
    throw createError("You are not authorized to access this order", 403);
  }

  const [enriched] = await attachCustomerOrderSummaries([order]);
  return enriched;
};

export const getAdminOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .lean();

  if (!order) {
    throw createError("Order not found", 404);
  }

  const [payments, refundHistory] = await Promise.all([
    Payment.find({ order: order._id })
      .select("-signature -__v")
      .sort({ createdAt: -1 })
      .lean(),
    PaymentRefund.find({ order: order._id }).sort({ createdAt: -1 }).lean(),
  ]);

  const primaryPayment =
    payments.find((p) =>
      ["Paid", "RefundPending", "PartiallyRefunded", "Refunded"].includes(
        p.status,
      ),
    ) ||
    payments[0] ||
    null;

  const eligibility = isOrderCancellable(order);

  const paymentDetails = primaryPayment
    ? {
        _id: primaryPayment._id,
        provider: primaryPayment.provider,
        razorpayOrderId: primaryPayment.razorpayOrderId || null,
        razorpayPaymentId: primaryPayment.razorpayPaymentId || null,
        amount: primaryPayment.amount,
        currency: primaryPayment.currency || "INR",
        status: primaryPayment.status,
        paymentMethod: primaryPayment.paymentMethod || null,
        verifiedAt: primaryPayment.verifiedAt || null,
        failureReason: primaryPayment.failureReason || null,
        refundedAmount: Number(primaryPayment.refundedAmount || 0),
        reservedRefundAmount: Number(primaryPayment.reservedRefundAmount || 0),
        remainingRefundableAmount: Number(
          Math.max(
            0,
            Number(primaryPayment.amount || 0) -
              Number(primaryPayment.refundedAmount || 0) -
              Number(primaryPayment.reservedRefundAmount || 0),
          ).toFixed(2),
        ),
        refundReconciliationRequired: Boolean(
          primaryPayment.refundReconciliationRequired,
        ),
        refundReconciliationReason:
          primaryPayment.refundReconciliationReason || null,
        refundReconciliationAt: primaryPayment.refundReconciliationAt || null,
        refundId: primaryPayment.refundId || null,
        refundedAt: primaryPayment.refundedAt || null,
      }
    : null;

  return {
    ...order,
    cancellable: eligibility.cancellable,
    cancelIneligibleReason: eligibility.reason,
    paymentDetails,
    refundSummary: buildRefundSummary({
      order,
      payment: primaryPayment,
      refunds: refundHistory,
    }),
    refundHistory,
  };
};

export const cancelOrder = async (
  orderId,
  userId,
  { reason = "", comment = "" } = {},
  { isAdmin = false, actorId = userId } = {},
) => {
  const trimmedReason = String(reason || "").trim();
  const trimmedComment = String(comment || "").trim();

  if (!trimmedReason || trimmedReason.length < 3) {
    throw createError("Please provide a valid cancellation reason", 400);
  }

  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) {
    throw createError("Order not found", 404);
  }

  if (!isAdmin && existingOrder.user.toString() !== userId.toString()) {
    throw createError("You are not authorized to cancel this order", 403);
  }

  if (existingOrder.orderStatus === "Cancelled") {
    throw createError("Order is already cancelled", 409);
  }

  const eligibility = isOrderCancellable(existingOrder);
  if (!eligibility.cancellable) {
    throw createError(eligibility.reason, 400);
  }

  const session = await mongoose.startSession();
  let reservedRefund = null;
  let cancelledOrder = null;

  try {
    session.startTransaction();

    const cancelledAt = new Date();
    const actorSource = isAdmin ? "ADMIN" : "USER";
    const historyNote = trimmedComment
      ? `Cancelled (${trimmedReason}): ${trimmedComment}`
      : `Cancelled (${trimmedReason})`;

    // Atomic conditional cancellation prevents concurrent double cancel / ship races.
    cancelledOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        ...(isAdmin ? {} : { user: existingOrder.user }),
        orderStatus: { $in: ["Pending", "Confirmed"] },
        $and: [
          {
            $or: [
              { "shipment.shippedAt": null },
              { "shipment.shippedAt": { $exists: false } },
            ],
          },
          {
            $or: [
              { "shipment.pickupScheduledAt": null },
              { "shipment.pickupScheduledAt": { $exists: false } },
            ],
          },
          {
            $or: [
              { "shipment.deliveredAt": null },
              { "shipment.deliveredAt": { $exists: false } },
            ],
          },
          {
            $or: [
              { "shipment.awbCode": null },
              { "shipment.awbCode": "" },
              { "shipment.awbCode": { $exists: false } },
            ],
          },
        ],
        "shipment.currentStatus": {
          $nin: Array.from(DISPATCHED_SHIPMENT_STATUSES),
        },
      },
      {
        $set: {
          orderStatus: "Cancelled",
          cancelledAt,
          cancellationReason: trimmedReason.slice(0, 200),
          cancellationComment: trimmedComment
            ? trimmedComment.slice(0, 500)
            : null,
          cancelledBy: actorSource,
          cancelledByUserId: actorId || userId || null,
        },
        $push: {
          orderStatusHistory: {
            status: "Cancelled",
            note: historyNote.slice(0, 500),
            changedBy: actorId || userId || null,
            source: actorSource,
            timestamp: cancelledAt,
          },
        },
      },
      { new: true, session },
    );

    if (!cancelledOrder) {
      throw createError(
        "Order status changed concurrently and can no longer be cancelled",
        409,
      );
    }

    // Restore stock and create idempotent inventory history
    for (const [index, item] of cancelledOrder.items.entries()) {
      await updateVariantStock({
        productId: item.product,
        variantId: item.variantId,
        quantity: item.quantity,
        direction: "IN",
        type: "Cancellation",
        referenceType: "Order",
        referenceId: cancelledOrder._id,
        performedBy: actorId || userId || cancelledOrder.user,
        note: `Stock restored for cancelled order ${cancelledOrder.orderNumber}`,
        idempotencyKey: `order-cancel:${cancelledOrder._id}:${index}`,
        session,
      });
    }

    // Restore coupon usage if coupon was applied
    if (cancelledOrder.coupon?.couponId) {
      const couponUpdate = await Coupon.updateOne(
        {
          _id: cancelledOrder.coupon.couponId,
          usedCount: { $gt: 0 },
        },
        {
          $inc: { usedCount: -1 },
        },
        { session },
      );

      if (couponUpdate.modifiedCount !== 1) {
        throw createError("Unable to restore coupon usage", 400);
      }

      const usageUpdate = await CouponUsage.updateOne(
        {
          coupon: cancelledOrder.coupon.couponId,
          user: cancelledOrder.user,
          usedCount: { $gt: 0 },
        },
        {
          $inc: { usedCount: -1 },
        },
        { session },
      );

      if (usageUpdate.modifiedCount !== 1) {
        throw createError("Unable to restore user coupon usage", 400);
      }
    }

    // Handle refund reservation for paid Online orders inside the same transaction.
    if (cancelledOrder.paymentMethod === "Online") {
      const paidPayment = await Payment.findOne({
        order: cancelledOrder._id,
        status: { $in: ["Paid", "PartiallyRefunded"] },
      })
        .sort({ createdAt: -1 })
        .session(session);

      if (paidPayment) {
        if (paidPayment.refundReconciliationRequired) {
          cancelledOrder.refundStatus = "RECONCILIATION_REQUIRED";
          cancelledOrder.refundAmount = Number(
            paidPayment.amount - (paidPayment.refundedAmount || 0),
          );
          cancelledOrder.refundRequestedAt = cancelledAt;
          cancelledOrder.refundFailureReason =
            "Manual payment reconciliation required before initiating refund";
          await cancelledOrder.save({ session });
        } else {
          reservedRefund = await reserveCancellationRefundInSession({
            order: cancelledOrder,
            payment: paidPayment,
            userId: actorId || userId || cancelledOrder.user,
            initiatedByRole: actorSource,
            reason: trimmedReason,
            session,
          });
        }
      } else {
        cancelledOrder.refundStatus = "NOT_REQUIRED";
        cancelledOrder.refundAmount = 0;
        await cancelledOrder.save({ session });
      }
    } else if (cancelledOrder.paymentMethod === "COD") {
      cancelledOrder.refundStatus =
        cancelledOrder.paymentStatus === "Paid" ? "PENDING" : "NOT_REQUIRED";
      cancelledOrder.refundAmount =
        cancelledOrder.paymentStatus === "Paid"
          ? cancelledOrder.totalAmount
          : 0;
      if (cancelledOrder.paymentStatus === "Paid") {
        cancelledOrder.refundRequestedAt = cancelledAt;
      }
      await cancelledOrder.save({ session });
    }

    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }

  // Trigger Razorpay refund outside the DB transaction so gateway timeouts never undo cancellation/stock.
  if (reservedRefund?.paymentRefund) {
    await executeReservedRazorpayRefund({
      paymentRefund: reservedRefund.paymentRefund,
      payment: reservedRefund.payment,
      order: reservedRefund.order,
      swallowGatewayError: true,
    });
  }

  await sendOrderNotifications({
    customerId: cancelledOrder.user,
    order: cancelledOrder,
    type: "ORDER_CANCELLED",
    title: "Order Cancelled",
    message:
      cancelledOrder.paymentMethod === "Online" &&
      ["Paid", "PartiallyRefunded"].includes(cancelledOrder.paymentStatus)
        ? `Your order ${cancelledOrder.orderNumber} has been cancelled and your refund has been initiated.`
        : `Your order ${cancelledOrder.orderNumber} has been cancelled.`,
  });

  return isAdmin
    ? getAdminOrderById(cancelledOrder._id)
    : getOrderById(cancelledOrder._id, cancelledOrder.user);
};

export const getAllOrders = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    search,
    sort = "newest",
    startDate,
    endDate,
  } = query;

  const skip = (page - 1) * limit;

  const filter = {};

  if (status) {
    filter.orderStatus = status;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      const nextDay = new Date(`${endDate}T00:00:00.000Z`);

      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      filter.createdAt.$lt = nextDay;
    }
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const searchRegex = {
      $regex: escapedSearch,
      $options: "i",
    };

    const matchingUsers = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).distinct("_id");

    filter.$or = [
      { orderNumber: searchRegex },
      { "items.productName": searchRegex },
      { "items.sku": searchRegex },
      { user: { $in: matchingUsers } },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "amount-high": { totalAmount: -1 },
    "amount-low": { totalAmount: 1 },
  };

  const sortBy = sortOptions[sort] || sortOptions.newest;

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),

    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      limit,
    },
  };
};

const ORDER_STATUS_TRANSITIONS = {
  Pending: ["Confirmed"],
  Confirmed: ["Processing"],
  Processing: ["Shipped"],
  Shipped: ["Delivered"],
};

export const updateOrderStatus = async (
  orderId,
  orderStatus,
  changedBy = null,
) => {
  console.log("UPDATE ORDER STATUS STARTED:", {
    orderId,
    orderStatus,
    changedBy,
  });

  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  const ORDER_STATUS_TRANSITIONS = {
    Pending: ["Confirmed"],
    Confirmed: ["Processing"],
    Processing: ["Shipped"],
    Shipped: ["Delivered"],
  };

  const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.orderStatus];

  if (!allowedStatuses?.includes(orderStatus)) {
    throw createError(
      `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      400,
    );
  }

  // Update order status
  order.orderStatus = orderStatus;

  if (orderStatus === "Delivered") {
    order.deliveredAt = new Date();
  }

  // Add order status history
  order.orderStatusHistory.push({
    status: orderStatus,
    note: `Order status updated to ${orderStatus}`,
    changedBy,
    source: "ADMIN",
    timestamp: new Date(),
  });

  await order.save();

  console.log("ORDER STATUS SAVED:", order.orderNumber, orderStatus);

  // Send customer email
  await sendOrderStatusEmail(order);

  // In-app notification
  const notificationByStatus = {
    Confirmed: {
      type: "ORDER_CONFIRMED",
      title: "Order Confirmed",
      message: `Your order ${order.orderNumber} has been confirmed.`,
    },
    Processing: {
      type: "SYSTEM",
      title: "Order Processing",
      message: `Your order ${order.orderNumber} is being processed.`,
    },
    Shipped: {
      type: "ORDER_SHIPPED",
      title: "Order Shipped",
      message: `Your order ${order.orderNumber} has been shipped.`,
    },
    Delivered: {
      type: "ORDER_DELIVERED",
      title: "Order Delivered",
      message: `Your order ${order.orderNumber} has been delivered.`,
    },
  };

  const notification = notificationByStatus[orderStatus];

  if (notification) {
    await sendOrderNotifications({
      customerId: order.user,
      order,
      ...notification,
    });
  }

  console.log("UPDATE ORDER STATUS COMPLETED:", order.orderNumber);

  return order;
};

export const updatePaymentStatus = async (
  orderId,
  paymentStatus,
  adminId = null,
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.paymentStatus === "Refunded") {
    throw createError("Refunded payment status cannot be changed", 400);
  }

  if (order.paymentStatus === paymentStatus) {
    throw createError("Payment already has this status", 400);
  }

  // Online payments must be verified through payment gateway
  if (order.paymentMethod === "Online") {
    throw createError(
      "Online payment status must be updated through payment gateway verification",
      400,
    );
  }

  // COD payment can be marked as Paid only after delivery
  if (paymentStatus === "Paid" && order.orderStatus !== "Delivered") {
    throw createError(
      "COD payment can only be marked as Paid after delivery",
      400,
    );
  }

  const allowedTransitions = {
    Pending: ["Paid"],
    Paid: ["Refunded"],
    Failed: [],
  };

  const allowedStatuses = allowedTransitions[order.paymentStatus];

  if (!allowedStatuses?.includes(paymentStatus)) {
    throw createError(
      `Cannot change payment status from ${order.paymentStatus} to ${paymentStatus}`,
      400,
    );
  }

  if (paymentStatus === "Refunded") {
    if (!["Cancelled", "Delivered"].includes(order.orderStatus)) {
      throw createError(
        "COD refunds can only be recorded for cancelled or delivered orders",
        400,
      );
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const orderDoc = await Order.findById(orderId).session(session);
        const now = new Date();

        const refundDoc = new PaymentRefund({
          payment: null,
          order: orderDoc._id,
          user: orderDoc.user,
          referenceType: "OrderCancellation",
          referenceId: orderDoc._id,
          attempt: 1,
          provider: "Manual",
          amount: orderDoc.totalAmount,
          currency: "INR",
          status: "Processed",
          idempotencyKey: `cod-manual-refund-${orderDoc._id}-${Date.now()}`,
          reason:
            orderDoc.cancellationReason || "Manual COD refund recorded by admin",
          initiatedBy: adminId,
          initiatedByRole: "ADMIN",
          processedAt: now,
        });

        await refundDoc.save({ session });

        orderDoc.paymentStatus = "Refunded";
        orderDoc.refundStatus = "SUCCESS";
        orderDoc.refundAmount = orderDoc.totalAmount;
        orderDoc.refundRequestedAt = orderDoc.refundRequestedAt || now;
        orderDoc.refundCompletedAt = now;
        await orderDoc.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return Order.findById(orderId);
  }

  order.paymentStatus = paymentStatus;

  await order.save();

  return order;
};

export const createMockShipment = async (orderId, adminId = null) => {
  if (!shiprocketConfig.testMode) {
    throw createError(
      "Mock shipment creation is available only in test mode",
      403,
    );
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.orderStatus === "Cancelled") {
    throw createError("Cannot create shipment for a cancelled order", 400);
  }

  if (order.shipment?.shipmentId) {
    throw createError("Shipment already exists for this order", 409);
  }

  if (!["Confirmed", "Processing"].includes(order.orderStatus)) {
    throw createError(
      "Order must be Confirmed or Processing before shipment creation",
      400,
    );
  }

  const mockResponse = await createShiprocketOrder({
    order_id: order.orderNumber,
  });

  if (!mockResponse?.mock || !mockResponse.shipment_id) {
    throw createError("Mock shipment was not created", 500);
  }

  order.shipment.provider = "SHIPROCKET";
  order.shipment.mode = "MOCK";
  order.shipment.shipmentId = String(mockResponse.shipment_id);
  order.shipment.currentStatus = "NEW";

  order.shipment.trackingHistory.push({
    status: "NEW",
    description: "Mock shipment created for testing",
    source: "SYSTEM",
    timestamp: new Date(),
  });

  await order.save();

  return order;
};

const MOCK_TRACKING_STEPS = [
  "NEW",
  "PICKUP SCHEDULED",
  "PICKED UP",
  "IN TRANSIT",
  "OUT FOR DELIVERY",
  "DELIVERED",
];

export const updateMockShipmentTracking = async (
  orderId,
  { status, description, location = "" } = {},
) => {
  // Test mode validation
  if (!shiprocketConfig.testMode) {
    throw createError("Mock tracking is available only in test mode", 403);
  }

  // Validate request body
  if (!status) {
    throw createError("Tracking status is required", 400);
  }

  if (!description?.trim()) {
    throw createError("Tracking description is required", 400);
  }

  // Find order
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  // Validate shipment
  if (!order.shipment?.shipmentId) {
    throw createError("Shipment not found for this order", 404);
  }

  // Validate cancelled order
  if (order.orderStatus === "Cancelled") {
    throw createError("Cannot update tracking for a cancelled order", 400);
  }

  // Normalize status
  const normalizedStatus = String(status).trim().toUpperCase();

  // Validate tracking sequence
  const currentIndex = MOCK_TRACKING_STEPS.indexOf(
    order.shipment.currentStatus,
  );

  const nextIndex = MOCK_TRACKING_STEPS.indexOf(normalizedStatus);

  if (nextIndex === -1) {
    throw createError("Invalid tracking status", 400);
  }

  if (currentIndex === -1) {
    throw createError("Current shipment status is invalid", 400);
  }

  if (nextIndex !== currentIndex + 1) {
    throw createError(
      `Invalid tracking transition. Next status must be ${
        MOCK_TRACKING_STEPS[currentIndex + 1] || "none"
      }`,
      400,
    );
  }

  // Update shipment status
  order.shipment.currentStatus = normalizedStatus;

  // Add tracking history
  order.shipment.trackingHistory.push({
    status: normalizedStatus,
    description: description.trim(),
    location: String(location || "").trim(),
    source: "SYSTEM",
    timestamp: new Date(),
  });

  // Delivered timestamp
  if (normalizedStatus === "DELIVERED") {
    order.shipment.deliveredAt = new Date();
  }

  // Save order
  await order.save();

  return order;
};

const ADMIN_TRACKING_STEPS = [
  "NEW",
  "PICKUP SCHEDULED",
  "PICKED UP",
  "IN TRANSIT",
  "OUT FOR DELIVERY",
  "DELIVERED",
];

// ==========================================
// Update Shipment Tracking (Admin)
// ==========================================

export const updateShipmentTracking = async (
  orderId,
  data = {},
  adminId = null,
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.orderStatus === "Cancelled") {
    throw createError("Cannot update shipment for a cancelled order", 400);
  }

  // Ensure shipment object exists
  if (!order.shipment) {
    order.shipment = {};
  }

  const shipment = order.shipment;

  const {
    provider,
    shipmentId,
    awbCode,
    courierName,
    trackingUrl,
    estimatedDeliveryDate,
    status,
    description,
    location,
  } = data;

  // ==========================================
  // Update Courier Details
  // ==========================================

  if (provider !== undefined) {
    shipment.provider = provider;
  }

  if (shipmentId !== undefined) {
    shipment.shipmentId = shipmentId.trim();
  }

  if (awbCode !== undefined) {
    shipment.awbCode = awbCode.trim();
  }

  if (courierName !== undefined) {
    shipment.courierName = courierName.trim();
  }

  if (trackingUrl !== undefined) {
    shipment.trackingUrl = trackingUrl;
  }

  if (estimatedDeliveryDate !== undefined) {
    const date = new Date(estimatedDeliveryDate);

    if (Number.isNaN(date.getTime())) {
      throw createError("Invalid estimated delivery date", 400);
    }

    shipment.estimatedDeliveryDate = date;
  }

  // ==========================================
  // Update Tracking Status
  // ==========================================

  if (status !== undefined) {
    const normalizedStatus = String(status).trim().toUpperCase();

    const currentStatus = String(
      shipment.currentStatus || "PENDING",
    ).toUpperCase();

    const currentIndex =
      currentStatus === "PENDING"
        ? -1
        : ADMIN_TRACKING_STEPS.indexOf(currentStatus);

    const nextIndex = ADMIN_TRACKING_STEPS.indexOf(normalizedStatus);

    if (nextIndex === -1) {
      throw createError("Invalid shipment status", 400);
    }

    if (currentIndex === -1 && currentStatus !== "PENDING") {
      throw createError("Current shipment status is invalid", 400);
    }

    if (nextIndex !== currentIndex + 1) {
      throw createError(
        `Next tracking status must be ${
          ADMIN_TRACKING_STEPS[currentIndex + 1] || "none"
        }`,
        400,
      );
    }

    if (!description?.trim()) {
      throw createError("Tracking description is required", 400);
    }

    const now = new Date();

    shipment.currentStatus = normalizedStatus;

    shipment.trackingHistory.push({
      status: normalizedStatus,
      description: description.trim(),
      location: String(location || "").trim(),
      source: "ADMIN",
      timestamp: now,
    });

    if (normalizedStatus === "PICKUP SCHEDULED") {
      shipment.pickupScheduledAt = now;
    }

    if (normalizedStatus === "PICKED UP") {
      shipment.shippedAt = now;
    }

    if (normalizedStatus === "DELIVERED") {
      shipment.deliveredAt = now;
    }

    if (location?.trim()) {
      shipment.lastLocation = location.trim();
    }
  }

  // ==========================================
  // Validate Shipment Identifier
  // ==========================================

  if (!shipment.shipmentId && !shipment.awbCode) {
    throw createError("Shipment ID or AWB number is required", 400);
  }

  // ==========================================
  // Save Shipment
  // ==========================================

  await order.save();

  return order;
};

// ==========================================
// Get User Order Tracking
// ==========================================

export const getUserOrderTracking = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })
    .select("orderNumber orderStatus createdAt shipment")
    .lean();

  if (!order) {
    throw createError("Order not found", 404);
  }

  const shipment = order.shipment;

  if (!shipment?.shipmentId && !shipment?.awbCode) {
    throw createError("Shipment tracking is not available yet", 404);
  }

  return {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,

    shipment: {
      provider: shipment.provider,
      mode: shipment.mode,
      shipmentId: shipment.shipmentId,
      awbCode: shipment.awbCode,
      courierName: shipment.courierName,
      trackingUrl: shipment.trackingUrl,
      currentStatus: shipment.currentStatus,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      pickupScheduledAt: shipment.pickupScheduledAt,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      lastLocation: shipment.lastLocation,
      trackingHistory: shipment.trackingHistory || [],
    },
  };
};