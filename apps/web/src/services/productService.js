import axiosInstance from "@/lib/axios";

const productService = {
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get("/products", {
      params: {
        isActive: true,
        ...params,
      },
    });

    return response.data;
  },

  getProductById: async (productId) => {
    const response = await axiosInstance.get(`/products/${productId}`);

    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await axiosInstance.get(`/products/slug/${slug}`);

    return response.data;
  },
};

export default productService;
