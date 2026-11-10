import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "@/services/authService";

// Login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// Register
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Get Current User
export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

// Update Profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed",
      );
    }
  },
);

// Change Password
export const changeUserPassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      return await authService.changePassword(passwordData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password change failed",
      );
    }
  },
);

// Logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.logout();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset link",
      );
    }
  },
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(resetData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed",
      );
    }
  },
);
