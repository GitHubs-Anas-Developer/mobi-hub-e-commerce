import axiosInstance from "@/lib/axios";

const adminReviewService = {
  // Get all reviews (Admin)
  getReviews: async (params = {}) => {
    const response = await axiosInstance.get("/reviews/admin/all", {
      params,
    });

    return response.data;
  },

  // Update review visibility (Admin)
  updateReviewVisibility: async (reviewId, isVisible) => {
    const response = await axiosInstance.patch(
      `/reviews/admin/${reviewId}/visibility`,
      { isVisible },
    );

    return response.data;
  },
};

export default adminReviewService;
