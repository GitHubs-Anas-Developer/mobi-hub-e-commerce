import axiosInstance from "@/lib/axios";

const orderService = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post("/orders", orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await axiosInstance.get("/orders");
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  },

  // Customer order tracking
  getOrderTracking: async (orderId) => {
    console.log("TRACKING API REQUEST:", `/orders/${orderId}/tracking`);

    try {
      const response = await axiosInstance.get(`/orders/${orderId}/tracking`, {
        timeout: 15000,
      });

      console.log("TRACKING API SUCCESS:", response.data);
      return response.data;
    } catch (error) {
      console.error("TRACKING API FAILED:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    const response = await axiosInstance.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export default orderService;
