import axiosInstance from "@/lib/axios";

const adminPaymentService = {
  getPayments: async (params = {}) => {
    const response = await axiosInstance.get("/payments/admin/transactions", {
      params,
    });
    return response.data;
  },

  getRefunds: async (params = {}) => {
    const response = await axiosInstance.get("/payments/admin/refunds", {
      params,
    });
    return response.data;
  },

  getOrderPaymentDetails: async (orderId) => {
    const response = await axiosInstance.get(`/payments/admin/order/${orderId}`);
    return response.data;
  },

  processRefund: async (payload) => {
    const response = await axiosInstance.post("/payments/admin/refund", payload);
    return response.data;
  },

  syncRefund: async (orderId) => {
    const response = await axiosInstance.post("/payments/admin/refund/sync", {
      orderId,
    });
    return response.data;
  },
};

export default adminPaymentService;

