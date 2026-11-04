import axiosInstance from "@/lib/axios";

const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  return response.data;
};

const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

// Forgot Password
const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", {
    email,
  });
  return response.data;
};

// Reset Password
const resetPassword = async (resetData) => {
  const response = await axiosInstance.post("/auth/reset-password", resetData);
  return response.data;
};

const authService = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
};

export default authService;
