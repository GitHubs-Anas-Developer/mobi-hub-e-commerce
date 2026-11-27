import axiosInstance from "@/lib/axios";

const adminInventoryService = {
  getLowStock: async (params = {}) => {
    const response = await axiosInstance.get("/inventory/low-stock", {
      params,
    });
    return response.data;
  },

  getOutOfStock: async (params = {}) => {
    const response = await axiosInstance.get("/inventory/out-of-stock", {
      params,
    });
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await axiosInstance.get("/inventory/history", {
      params,
    });
    return response.data;
  },

  adjustStock: async ({ productId, variantId, adjustment, note = "" }) => {
    const response = await axiosInstance.post("/inventory/adjust", {
      productId,
      variantId,
      adjustment: Number(adjustment),
      note,
    });
    return response.data;
  },
};

export default adminInventoryService;

