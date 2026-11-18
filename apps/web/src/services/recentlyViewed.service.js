import axiosInstance from "@/lib/axios";

const recentlyViewedService = {
  addRecentlyViewed: async (productId) => {
    const response = await axiosInstance.post(`/recently-viewed/${productId}`);

    return response.data;
  },

  getRecentlyViewed: async () => {
    const response = await axiosInstance.get("/recently-viewed");

    return response.data;
  },

  clearRecentlyViewed: async () => {
    const response = await axiosInstance.delete("/recently-viewed");

    return response.data;
  },
};

export default recentlyViewedService;
