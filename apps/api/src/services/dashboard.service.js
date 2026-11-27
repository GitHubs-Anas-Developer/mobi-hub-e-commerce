import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import PaymentRefund from "../models/payment-refund.model.js";
import Return from "../models/return.model.js";
import Review from "../models/review.model.js";
import { createError } from "../utils/createError.js";

export const getDashboardOverview = async () => {
  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    activeProducts,
    lowStockProducts,
    revenueResult,
    totalRefunds,
    pendingPayments,
    pendingRefundOrders,
    pendingRefundAttempts,
    pendingReturnRefunds,
  ] = await Promise.all([
    Order.countDocuments(),

    User.countDocuments({
      role: "customer",
    }),

    Product.countDocuments(),

    Product.countDocuments({
      isActive: true,
    }),

    Product.countDocuments({
      totalStock: { $lte: 5 },
      isActive: true,
    }),

    Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          orderStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]),

    Payment.countDocuments({
      status: "Refunded",
    }),

    Payment.countDocuments({
      status: "Created",
    }),

    Order.countDocuments({
      refundStatus: {
        $in: ["PENDING", "PROCESSING", "RECONCILIATION_REQUIRED"],
      },
    }),

    PaymentRefund.countDocuments({
      status: { $in: ["Pending", "Processing"] },
    }),

    Return.countDocuments({
      status: { $in: ["InspectionPassed", "RefundProcessing"] },
    }),
  ]);

  const pendingRefunds = Math.max(
    pendingRefundOrders,
    pendingRefundAttempts + pendingReturnRefunds,
  );

  return {
    totalOrders,
    totalCustomers,
    totalProducts,
    activeProducts,
    inactiveProducts: totalProducts - activeProducts,
    lowStockProducts,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    totalRefunds,
    pendingPayments,
    pendingRefunds,
  };
};

export const getSalesAnalytics = async (period = "7d") => {
  const now = new Date();
  let startDate;
  let dateFormat;

  if (period === "7d") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    dateFormat = "%Y-%m-%d";
  } else if (period === "30d") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    dateFormat = "%Y-%m-%d";
  } else if (period === "12m") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    dateFormat = "%Y-%m";
  } else {
    throw createError("Invalid sales analytics period", 400);
  }

  const sales = await Order.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        orderStatus: { $ne: "Cancelled" },
        createdAt: { $gte: startDate, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: "$createdAt",
          },
        },
        totalSales: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    period,
    sales,
  };
};

export const getRecentOrders = async (limit = 10) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name email")
    .select(
      "orderNumber user items totalAmount paymentMethod paymentStatus orderStatus createdAt",
    )
    .lean();

  return orders;
};

export const getTopProducts = async (limit = 10) => {
  const products = await Order.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        orderStatus: { $ne: "Cancelled" },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        productName: { $first: "$items.productName" },
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: {
            $multiply: ["$items.sellingPrice", "$items.quantity"],
          },
        },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);

  return products;
};

export const getLowStockProducts = async (threshold = 5) => {
  const products = await Product.find({
    isActive: true,
    totalStock: { $lte: threshold },
  })
    .select("name slug brand thumbnail totalStock variants")
    .sort({ totalStock: 1 })
    .lean();

  return products;
};

export const getOrderStats = async () => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        totalOrders: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        totalOrders: 1,
      },
    },
    { $sort: { status: 1 } },
  ]);

  const statusCounts = {
    Pending: 0,
    Confirmed: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  stats.forEach((item) => {
    statusCounts[item.status] = item.totalOrders;
  });

  return statusCounts;
};

export const getPaymentStats = async () => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: {
          method: "$paymentMethod",
          status: "$paymentStatus",
        },
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        method: "$_id.method",
        status: "$_id.status",
        totalOrders: 1,
        totalAmount: 1,
      },
    },
    { $sort: { method: 1, status: 1 } },
  ]);

  return stats;
};

export const getRecentCustomerActivity = async (limit = 8) => {
  const [recentCustomers, recentReviews] = await Promise.all([
    User.find({ role: "customer" })
      .sort({ lastLoginAt: -1, createdAt: -1 })
      .limit(limit)
      .select("name email phone isActive isEmailVerified lastLoginAt createdAt")
      .lean(),
    Review.find()
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 5))
      .populate("user", "name email")
      .populate("product", "name slug")
      .select("rating comment isVisible createdAt")
      .lean(),
  ]);

  return {
    recentCustomers,
    recentReviews,
  };
};
