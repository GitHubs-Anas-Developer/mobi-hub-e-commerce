import axiosInstance from "@/lib/axios";

const adminProductVideoService = {
  // Get active product videos (public)
  getActiveProductVideos: async (params = {}) => {
    const response = await axiosInstance.get("/product-videos/active", {
      params,
    });

    return response.data;
  },

  // Get all product videos (admin)
  getProductVideos: async (params = {}) => {
    const response = await axiosInstance.get("/product-videos", {
      params,
    });

    return response.data;
  },

  // Get single product video
  getProductVideoById: async (videoId) => {
    const response = await axiosInstance.get(`/product-videos/${videoId}`);

    return response.data;
  },

  // Create product video and upload to Cloudinary
  createProductVideo: async (videoData, file) => {
    const formData = new FormData();

    formData.append("productId", videoData.productId);
    formData.append("title", videoData.title);

    if (videoData.description) {
      formData.append("description", videoData.description);
    }

    formData.append("video", file);

    const response = await axiosInstance.post("/product-videos", formData);

    return response.data;
  },

  // Update product video
  updateProductVideo: async (videoId, videoData) => {
    const response = await axiosInstance.patch(
      `/product-videos/${videoId}`,
      videoData,
    );

    return response.data;
  },

  // Delete product video
  deleteProductVideo: async (videoId) => {
    const response = await axiosInstance.delete(`/product-videos/${videoId}`);

    return response.data;
  },
};

export default adminProductVideoService;
