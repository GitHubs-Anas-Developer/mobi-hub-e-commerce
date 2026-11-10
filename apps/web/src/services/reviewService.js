import axiosInstance from "@/lib/axios";

const reviewService = {
  // Get reviews and rating statistics for a product
  getProductReviews: async (productId, params = {}) => {
    const response = await axiosInstance.get(`/reviews/product/${productId}`, {
      params,
    });

    return response.data;
  },

  // Get authenticated user's reviews
  getMyReviews: async (params = {}) => {
    const response = await axiosInstance.get("/reviews/my", {
      params,
    });

    return response.data;
  },

  // Create a product review
  createReview: async (reviewData) => {
    const response = await axiosInstance.post("/reviews", reviewData);

    return response.data;
  },

  // Update an existing review
  updateReview: async (reviewId, reviewData) => {
    const response = await axiosInstance.patch(
      `/reviews/${reviewId}`,
      reviewData,
    );

    return response.data;
  },

  // Delete an existing review
  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);

    return response.data;
  },
};

export default reviewService;
