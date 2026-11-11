import axiosInstance from "@/lib/axios";

const adminUserService = {
  // Get all customers with search, filters and pagination
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get("/admin/users", {
      params,
    });

    return response.data;
  },

  // Get single customer details
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);

    return response.data;
  },

  // Activate / Deactivate customer
  updateUserStatus: async (userId, isActive) => {
    const response = await axiosInstance.patch(
      `/admin/users/${userId}/status`,
      { isActive },
    );

    return response.data;
  },
};

export default adminUserService;
