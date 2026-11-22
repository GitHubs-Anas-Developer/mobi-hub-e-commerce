import axiosInstance from "@/lib/axios";

const buildBannerFormData = (bannerData, files = {}) => {
  const formData = new FormData();

  Object.entries(bannerData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (files.desktopImage) {
    formData.append("desktopImage", files.desktopImage);
  }

  if (files.mobileImage) {
    formData.append("mobileImage", files.mobileImage);
  }

  return formData;
};

const adminBannerService = {
  // Get all banners (admin)
  getBanners: async (params = {}) => {
    const response = await axiosInstance.get("/banners", {
      params,
    });

    return response.data;
  },

  // Get single banner
  getBannerById: async (bannerId) => {
    const response = await axiosInstance.get(`/banners/${bannerId}`);

    return response.data;
  },

  // Get active banners (public)
  getActiveBanners: async (params = {}) => {
    const response = await axiosInstance.get("/banners/active", {
      params,
    });

    return response.data;
  },

  // Create banner
  createBanner: async (bannerData, files = {}) => {
    const formData = buildBannerFormData(bannerData, files);

    const response = await axiosInstance.post("/banners", formData);

    return response.data;
  },

  // Update banner
  updateBanner: async (bannerId, bannerData, files = {}) => {
    const formData = buildBannerFormData(bannerData, files);

    const response = await axiosInstance.patch(
      `/banners/${bannerId}`,
      formData,
    );

    return response.data;
  },

  // Delete banner
  deleteBanner: async (bannerId) => {
    const response = await axiosInstance.delete(`/banners/${bannerId}`);

    return response.data;
  },
};

export default adminBannerService;
