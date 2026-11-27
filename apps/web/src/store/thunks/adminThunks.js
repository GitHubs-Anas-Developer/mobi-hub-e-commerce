import { createAsyncThunk } from "@reduxjs/toolkit";
import dashboardService from "@/services/dashboardService";
import adminOrderService from "@/services/adminOrderService";

export const fetchAdminDashboardData = createAsyncThunk(
  "admin/fetchAdminDashboardData",
  async (period = "7d", { rejectWithValue }) => {
    try {
      const [
        overviewResponse,
        salesResponse,
        monthlySalesResponse,
        recentOrdersResponse,
        topProductsResponse,
        lowStockResponse,
        orderStatsResponse,
        paymentStatsResponse,
        recentActivityResponse,
      ] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getSalesAnalytics(period),
        period === "12m"
          ? Promise.resolve(null)
          : dashboardService.getSalesAnalytics("12m"),
        dashboardService.getRecentOrders(8),
        dashboardService.getTopProducts(6),
        dashboardService.getLowStockProducts(5),
        dashboardService.getOrderStats(),
        dashboardService.getPaymentStats(),
        dashboardService.getRecentActivity(8),
      ]);

      return {
        overview: overviewResponse.data || null,
        sales: salesResponse.data?.sales || [],
        monthlySales:
          period === "12m"
            ? salesResponse.data?.sales || []
            : monthlySalesResponse?.data?.sales || [],
        recentOrders: recentOrdersResponse.data || [],
        topProducts: topProductsResponse.data || [],
        lowStockProducts: lowStockResponse.data || [],
        orderStats: orderStatsResponse.data || {},
        paymentStats: paymentStatsResponse.data || [],
        recentCustomers: recentActivityResponse.data?.recentCustomers || [],
        recentReviews: recentActivityResponse.data?.recentReviews || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to load dashboard data. Please try again.",
      );
    }
  },
);

export const fetchAdminQuickOrder = createAsyncThunk(
  "admin/fetchAdminQuickOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await adminOrderService.getOrderById(orderId);
      return response.data?.order || null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load order details.",
      );
    }
  },
);

