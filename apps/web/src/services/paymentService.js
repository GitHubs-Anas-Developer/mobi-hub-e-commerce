import axiosInstance from "@/lib/axios";

const paymentService = {
  initiatePayment: async (orderId) => {
    const response = await axiosInstance.post("/payments/initiate", {
      orderId,
    });

    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post("/payments/verify", paymentData);

    return response.data;
  },
};

export default paymentService;
