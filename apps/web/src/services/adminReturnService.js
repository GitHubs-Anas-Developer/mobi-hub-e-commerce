import axiosInstance from "@/lib/axios";

const adminReturnService = {
  getReturns: async (params = {}) => {
    const response = await axiosInstance.get("/returns/admin", { params });
    return response.data;
  },

  reviewReturn: async (returnId, { decision, adminNote = "" }) => {
    const response = await axiosInstance.patch(
      `/returns/admin/${returnId}/review`,
      { decision, adminNote },
    );
    return response.data;
  },

  markReceived: async (returnId) => {
    const response = await axiosInstance.patch(
      `/returns/admin/${returnId}/received`,
    );
    return response.data;
  },

  inspectReturn: async (returnId, { inspectionStatus, adminNote = "" }) => {
    const response = await axiosInstance.patch(
      `/returns/admin/${returnId}/inspect`,
      { inspectionStatus, adminNote },
    );
    return response.data;
  },

  restoreStock: async (returnId) => {
    const response = await axiosInstance.patch(
      `/returns/admin/${returnId}/restore-stock`,
    );
    return response.data;
  },

  processReturnRefund: async (returnId, payload = {}) => {
    const response = await axiosInstance.post(
      `/returns/admin/${returnId}/refund`,
      payload,
    );
    return response.data;
  },
};

export default adminReturnService;

