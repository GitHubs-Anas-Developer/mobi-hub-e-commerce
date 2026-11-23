import axiosInstance from "@/lib/axios";

const subscribeNewsletter = async (email) => {
  const response = await axiosInstance.post("/newsletter/subscribe", { email });

  return response.data;
};

const newsletterService = {
  subscribeNewsletter,
};

export default newsletterService;
