import axiosInstance from "@/lib/axios";

const adminCouponService = {
  // Get all coupons
  getCoupons: async (params = {}) => {
    const response = await axiosInstance.get("/coupons", {
      params,
    });

    return response.data;
  },

  // Get single coupon
  getCouponById: async (couponId) => {
    const response = await axiosInstance.get(`/coupons/${couponId}`);

    return response.data;
  },

  // Create coupon
  createCoupon: async (couponData) => {
    const response = await axiosInstance.post("/coupons", couponData);

    return response.data;
  },

  // Update coupon
  updateCoupon: async (couponId, couponData) => {
    const response = await axiosInstance.patch(
      `/coupons/${couponId}`,
      couponData,
    );

    return response.data;
  },

  // Toggle coupon status
  toggleCouponStatus: async (couponId, isActive) => {
    const response = await axiosInstance.patch(`/coupons/${couponId}/status`, {
      isActive,
    });

    return response.data;
  },

  // Delete coupon
  deleteCoupon: async (couponId) => {
    const response = await axiosInstance.delete(`/coupons/${couponId}`);

    return response.data;
  },
};

export default adminCouponService;
