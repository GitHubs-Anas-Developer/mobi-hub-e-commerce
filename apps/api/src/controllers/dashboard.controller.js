import {
  getDashboardOverview,
  getSalesAnalytics,
  getRecentOrders,
  getTopProducts,
  getLowStockProducts,
  getOrderStats,
  getPaymentStats,
} from "../services/dashboard.service.js";

export const dashboardOverview = async (req, res, next) => {
  try {
    const data = await getDashboardOverview();

    res.status(200).json({
      success: true,
      message: "Dashboard overview fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const salesAnalytics = async (req, res, next) => {
  try {
    const { period = "7d" } = req.query;
    const data = await getSalesAnalytics(period);

    res.status(200).json({
      success: true,
      message: "Sales analytics fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const recentOrders = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const data = await getRecentOrders(limit);

    res.status(200).json({
      success: true,
      message: "Recent orders fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const topProducts = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const data = await getTopProducts(limit);

    res.status(200).json({
      success: true,
      message: "Top products fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const lowStockProducts = async (req, res, next) => {
  try {
    const threshold = Math.min(
      Math.max(Number(req.query.threshold) || 5, 0),
      100,
    );

    const data = await getLowStockProducts(threshold);

    res.status(200).json({
      success: true,
      message: "Low stock products fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const orderStats = async (req, res, next) => {
  try {
    const data = await getOrderStats();

    res.status(200).json({
      success: true,
      message: "Order statistics fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentStats = async (req, res, next) => {
  try {
    const data = await getPaymentStats();

    res.status(200).json({
      success: true,
      message: "Payment statistics fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
