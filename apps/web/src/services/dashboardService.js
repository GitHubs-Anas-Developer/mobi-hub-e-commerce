import axiosInstance from "@/lib/axios";

const dashboardService = {
  getOverview: async () => {
    const response = await axiosInstance.get("/admin/dashboard/overview");
    return response.data;
  },

  getSalesAnalytics: async (period = "7d") => {
    const response = await axiosInstance.get("/admin/dashboard/sales", {
      params: { period },
    });

    return response.data;
  },

  getRecentOrders: async (limit = 10) => {
    const response = await axiosInstance.get("/admin/dashboard/recent-orders", {
      params: { limit },
    });

    return response.data;
  },

  getTopProducts: async (limit = 10) => {
    const response = await axiosInstance.get("/admin/dashboard/top-products", {
      params: { limit },
    });

    return response.data;
  },

  getLowStockProducts: async (threshold = 5) => {
    const response = await axiosInstance.get("/admin/dashboard/low-stock", {
      params: { threshold },
    });

    return response.data;
  },

  getOrderStats: async () => {
    const response = await axiosInstance.get("/admin/dashboard/order-stats");

    return response.data;
  },

  getPaymentStats: async () => {
    const response = await axiosInstance.get("/admin/dashboard/payment-stats");

    return response.data;
  },
};

export default dashboardService;
