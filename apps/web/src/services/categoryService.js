import axiosInstance from "@/lib/axios";

const categoryService = {
  // Get active categories (Client)
  getCategories: async (params = {}) => {
    const response = await axiosInstance.get("/categories", {
      params: {
        isActive: true,
        ...params,
      },
    });

    return response.data;
  },

  // Get all categories (Admin - includes inactive)
  getAdminCategories: async (params = {}) => {
    const response = await axiosInstance.get("/categories", {
      params,
    });

    return response.data;
  },

  // Get single category
  getCategoryById: async (categoryId) => {
    const response = await axiosInstance.get(`/categories/${categoryId}`);

    return response.data;
  },

  // Create category
  createCategory: async (categoryData) => {
    const response = await axiosInstance.post("/categories", categoryData);

    return response.data;
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    const response = await axiosInstance.patch(
      `/categories/${categoryId}`,
      categoryData,
    );

    return response.data;
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);

    return response.data;
  },

  // Toggle category status
  toggleCategoryStatus: async (categoryId) => {
    const response = await axiosInstance.patch(
      `/categories/${categoryId}/status`,
    );

    return response.data;
  },
};

export default categoryService;
