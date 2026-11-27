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

  updateShipmentTracking: async (orderId, trackingData) => {
    const response = await axiosInstance.patch(
      `/orders/admin/${orderId}/shipment`,
      trackingData,
    );

    return response.data;
  },

  cancelOrder: async (orderId, { reason, comment = "" }) => {
    const response = await axiosInstance.patch(
      `/orders/admin/${orderId}/cancel`,
      {
        reason,
        ...(comment ? { comment } : {}),
      },
    );

    return response.data;
  },

  getOrderPaymentDetails: async (orderId) => {
    const response = await axiosInstance.get(`/payments/admin/order/${orderId}`);
    return response.data;
  },

  processOrderRefund: async ({
    orderId,
    paymentId,
    reason,
    amount,
    provider,
    manualRefundConfirmed,
  }) => {
    const payload = {
      ...(orderId ? { orderId } : {}),
      ...(paymentId ? { paymentId } : {}),
      ...(reason ? { reason } : {}),
      ...(amount !== undefined && amount !== "" && amount !== null
        ? { amount: Number(amount) }
        : {}),
      ...(provider ? { provider } : {}),
      ...(manualRefundConfirmed !== undefined ? { manualRefundConfirmed } : {}),
    };

    const response = await axiosInstance.post("/payments/admin/refund", payload);
    return response.data;
  },

  syncOrderRefund: async (orderId) => {
    const response = await axiosInstance.post("/payments/admin/refund/sync", {
      orderId,
    });
    return response.data;
  },
};

export default adminOrderService;
