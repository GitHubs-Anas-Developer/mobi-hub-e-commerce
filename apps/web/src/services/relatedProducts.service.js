import axiosInstance from "@/lib/axios";

const relatedProductsService = {
  getRelatedProducts: async (productId, limit = 10) => {
    const response = await axiosInstance.get(`/products/${productId}/related`, {
      params: { limit },
    });

    return response.data;
  },
};

export default relatedProductsService;
