import axiosInstance from "@/lib/axios";

const brandService = {
  // Get all brands
  getBrands: async (params = {}) => {
    const response = await axiosInstance.get("/brands", {
      params,
    });

    return response.data;
  },

  // Get single brand
  getBrandById: async (brandId) => {
    const response = await axiosInstance.get(`/brands/${brandId}`);

    return response.data;
  },

  // Create brand
  createBrand: async (brandData) => {
    const response = await axiosInstance.post("/brands", brandData);

    return response.data;
  },

  // Update brand
  updateBrand: async (brandId, brandData) => {
    const response = await axiosInstance.patch(`/brands/${brandId}`, brandData);

    return response.data;
  },

  // Delete brand
  deleteBrand: async (brandId) => {
    const response = await axiosInstance.delete(`/brands/${brandId}`);

    return response.data;
  },

  // Toggle brand status
  toggleBrandStatus: async (brandId) => {
    const response = await axiosInstance.patch(`/brands/${brandId}/status`);

    return response.data;
  },
};

export default brandService;
