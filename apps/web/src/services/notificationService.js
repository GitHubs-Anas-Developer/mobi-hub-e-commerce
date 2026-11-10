import axiosInstance from "@/lib/axios";

const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get("/notifications", {
      params,
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await axiosInstance.patch(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch("/notifications/read-all");
    return response.data;
  },

  removeNotification: async (notificationId) => {
    const response = await axiosInstance.delete(
      `/notifications/${notificationId}`,
    );
    return response.data;
  },

  removeAllNotifications: async () => {
    const response = await axiosInstance.delete("/notifications/delete-all");
    return response.data;
  },
};

export default notificationService;
