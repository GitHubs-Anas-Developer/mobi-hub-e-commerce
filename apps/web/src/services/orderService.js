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

  cancelOrder: async (orderId) => {
    const response = await axiosInstance.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
};

export default orderService;
