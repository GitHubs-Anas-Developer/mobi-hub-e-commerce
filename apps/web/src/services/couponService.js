import axiosInstance from "@/lib/axios";

const couponService = {
  applyCoupon: async (code) => {
    const response = await axiosInstance.post("/coupons/apply", {
      code,
    });

    return response.data;
  },
};

export default couponService;
