import axiosInstance from "@/lib/axios";

const subscribeNewsletter = async (email) => {
  const response = await axiosInstance.post("/newsletter/subscribe", { email });

  return response.data;
};

const getSubscribers = async (params = {}) => {
  const response = await axiosInstance.get("/newsletter/subscribers", {
    params,
  });

  return response.data;
};

const getStats = async () => {
  const response = await axiosInstance.get("/newsletter/stats");

  return response.data;
};

const newsletterService = {
  subscribeNewsletter,
  getSubscribers,
  getStats,
};

export default newsletterService;
