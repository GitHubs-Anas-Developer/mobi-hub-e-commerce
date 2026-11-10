import axiosInstance from "@/lib/axios";

const adminProductService = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get("/admin/products", {
      params,
    });

    return response.data;
  },

  // Get single product (including inactive)
  getProductById: async (productId) => {
    const response = await axiosInstance.get(`/admin/products/${productId}`);

    return response.data;
  },

  // Upload product images to Cloudinary
  uploadImages: async (files, type = "products") => {
    const formData = new FormData();

    formData.append("type", type);

    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await axiosInstance.post("/admin/upload/images", formData);

    return response.data;
  },

  // Create product
  createProduct: async (productData) => {
    const response = await axiosInstance.post("/products", productData);

    return response.data;
  },

  // Update product
  updateProduct: async (productId, productData) => {
    const response = await axiosInstance.patch(
      `/products/${productId}`,
      productData,
    );

    return response.data;
  },

  // Delete product
  deleteProduct: async (productId) => {
    const response = await axiosInstance.delete(`/products/${productId}`);

    return response.data;
  },

  // Toggle product active status
  toggleProductStatus: async (productId) => {
    const response = await axiosInstance.patch(`/products/${productId}/status`);

    return response.data;
  },
};

export default adminProductService;
