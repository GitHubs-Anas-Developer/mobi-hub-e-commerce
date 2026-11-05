import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateOrderNumber = () => {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `MH-${Date.now()}-${randomPart}`;
};
export const createOrder = async (userId, data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { addressId, paymentMethod } = data;

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

    // 4. Deduct product stock atomically
    for (const item of cart.items) {
      const product = item.product;
      const variant = product.variants.id(item.variantId);

      const stockUpdate = await Product.updateOne(
        {
          _id: product._id,
          isActive: true,
          variants: {
            $elemMatch: {
              _id: variant._id,
              isActive: true,
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
            totalStock: -item.quantity,
          },
        },
        { session },
      );

      if (stockUpdate.matchedCount !== 1) {
        throw createError(`Insufficient stock for ${product.name}`, 400);
      }
    }

    // 5. Calculate order amount
    const shippingFee = 0;
    const discount = 0;
    const totalAmount = subtotal + shippingFee - discount;

    // 6. Create order inside transaction
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
          totalAmount,
          paymentMethod,
        },
      ],
      { session },
    );

    // 7. Clear cart inside transaction
    cart.items = [];
    await cart.save({ session });

    // 8. Commit transaction
    await session.commitTransaction();

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

    // 3. Restore stock for each order item
    for (const item of order.items) {
      const stockUpdate = await Product.updateOne(
        {
          _id: item.product,
          "variants._id": item.variantId,
        },
        {
          $inc: {
            "variants.$.stock": item.quantity,
            totalStock: item.quantity,
          },
        },
        { session },
      );

      if (stockUpdate.matchedCount !== 1) {
        throw createError(
          `Unable to restore stock for ${item.productName}`,
          400,
        );
      }
    }

    // 4. Update order status
    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    await order.save({ session });

    // 5. Commit transaction
    await session.commitTransaction();

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
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.status) {
    filter.orderStatus = query.status;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
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
