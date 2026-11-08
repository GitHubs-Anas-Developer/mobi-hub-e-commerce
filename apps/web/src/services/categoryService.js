import axiosInstance from "@/lib/axios";

const categoryService = {
  getCategories: async (params = {}) => {
    const response = await axiosInstance.get("/categories", {
      params: {
        isActive: true,
        ...params,
      },
    });

    return response.data;
  },

  getCategoryById: async (categoryId) => {
    const response = await axiosInstance.get(`/categories/${categoryId}`);

    return response.data;
  },
};

export default categoryService;
