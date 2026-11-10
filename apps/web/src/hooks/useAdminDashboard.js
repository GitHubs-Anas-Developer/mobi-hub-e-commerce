"use client";

import { useCallback, useEffect, useState } from "react";
import dashboardService from "@/services/dashboardService";

const INITIAL_DATA = {
  overview: null,
  sales: [],
  recentOrders: [],
  topProducts: [],
  lowStockProducts: [],
  orderStats: {},
  paymentStats: [],
};

export default function useAdminDashboard(period = "7d") {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        overviewResponse,
        salesResponse,
        recentOrdersResponse,
        topProductsResponse,
        lowStockResponse,
        orderStatsResponse,
        paymentStatsResponse,
      ] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getSalesAnalytics(period),
        dashboardService.getRecentOrders(),
        dashboardService.getTopProducts(),
        dashboardService.getLowStockProducts(),
        dashboardService.getOrderStats(),
        dashboardService.getPaymentStats(),
      ]);

      setData({
        overview: overviewResponse.data,
        sales: salesResponse.data?.sales || [],
        recentOrders: recentOrdersResponse.data || [],
        topProducts: topProductsResponse.data || [],
        lowStockProducts: lowStockResponse.data || [],
        orderStats: orderStatsResponse.data || {},
        paymentStats: paymentStatsResponse.data || [],
      });
    } catch (err) {
      console.error("Admin Dashboard API Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refreshDashboard: fetchDashboard,
  };
}
