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

export const createOrder = async (userId, data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { addressId, paymentMethod, couponCode } = data;

    // 1. Validate shipping address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    })
      .session(session)
      .lean();

    if (!address) {
      throw createError("Shipping address not found", 404);
    }

    // 2. Get user's cart
    const cart = await Cart.findOne({ user: userId })
      .session(session)
      .populate({
        path: "items.product",
        options: { session },
      });

    if (!cart || cart.items.length === 0) {
      throw createError("Your cart is empty", 400);
    }

    const orderItems = [];
    let subtotal = 0;

    // 3. Validate products and prepare order items
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        throw createError("A product in your cart is unavailable", 400);
      }

      const variant = product.variants.id(item.variantId);

      if (!variant || !variant.isActive) {
        throw createError("A product variant is unavailable", 400);
      }

      if (variant.stock < item.quantity) {
        throw createError(`Insufficient stock for ${product.name}`, 400);
      }

      const itemSubtotal = variant.sellingPrice * item.quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        slug: product.slug,
        thumbnail: product.thumbnail,
        variantId: variant._id,
        sku: variant.sku,
        attributes: variant.attributes,
        quantity: item.quantity,
        mrp: variant.mrp,
        sellingPrice: variant.sellingPrice,
        subtotal: itemSubtotal,
      });
    }

    // 4. Calculate coupon discount
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

    // 5. Update coupon usage inside transaction
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

    // 6. Calculate final order amount
    const shippingFee = 0;
    const totalAmount = subtotal + shippingFee - discount;

    // 7. Create order inside transaction
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
        },
      ],
      { session },
    );

    // 8. Deduct stock and create inventory history
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

    // 9. Clear cart inside transaction
    cart.items = [];
    await cart.save({ session });

    // 10. Commit transaction
    // 10. Commit transaction
    await session.commitTransaction();

    // 11. Send notifications after successful transaction
    await sendOrderNotifications({
      customerId: userId,
      order,
      type: "ORDER_PLACED",
      title: "Order Placed Successfully",
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      notifyAdmins: true,
    });

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

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).lean();

  if (!order) {
    throw createError("Order not found", 404);
  }

  return order;
};

export const getAdminOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .lean();

  if (!order) {
    throw createError("Order not found", 404);
  }

  return order;
};

export const cancelOrder = async (orderId, userId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Find user's order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw createError("Order not found", 404);
    }

    // 2. Validate order status
    if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
      throw createError("This order cannot be cancelled at this stage", 400);
    }

    // 3. Restore stock and create inventory history
    for (const [index, item] of order.items.entries()) {
      await updateVariantStock({
        productId: item.product,
        variantId: item.variantId,
        quantity: item.quantity,
        direction: "IN",
        type: "Cancellation",
        referenceType: "Order",
        referenceId: order._id,
        performedBy: userId,
        note: `Stock restored for cancelled order ${order._id}`,
        idempotencyKey: `order-cancel:${order._id}:${index}`,
        session,
      });
    }

    // 4. Restore coupon usage if coupon was applied
    if (order.coupon?.couponId) {
      const couponUpdate = await Coupon.updateOne(
        {
          _id: order.coupon.couponId,
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
          coupon: order.coupon.couponId,
          user: userId,
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

    // 5. Update order status
    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    await order.save({ session });

    // 6. Commit transaction
    await session.commitTransaction();
    // Send order cancellation notification
    await sendOrderNotifications({
      customerId: userId,
      order,
      type: "ORDER_CANCELLED",
      title: "Order Cancelled",
      message: `Your order ${order.orderNumber} has been cancelled.`,
    });

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

export const updateOrderStatus = async (orderId, orderStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.orderStatus];

  if (!allowedStatuses?.includes(orderStatus)) {
    throw createError(
      `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      400,
    );
  }

  order.orderStatus = orderStatus;

  if (orderStatus === "Delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();

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

  return order;
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
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

  order.paymentStatus = paymentStatus;

  await order.save();

  return order;
};
