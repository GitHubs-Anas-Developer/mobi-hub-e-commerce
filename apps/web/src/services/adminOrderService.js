import axiosInstance from "@/lib/axios";

const adminOrderService = {
  // Get all orders with filters, search and pagination
  getOrders: async (params = {}) => {
    const response = await axiosInstance.get("/orders/admin/all", {
      params,
    });

    return response.data;
  },

  // Get single order details
  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/admin/${orderId}`);

    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, orderStatus) => {
    const response = await axiosInstance.patch(
      `/orders/admin/${orderId}/status`,
      { orderStatus },
    );

    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus) => {
    const response = await axiosInstance.patch(
      `/orders/admin/${orderId}/payment`,
      { paymentStatus },
    );

    return response.data;
  },
};

export default adminOrderService;
