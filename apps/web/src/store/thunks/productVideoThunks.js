import { createAsyncThunk } from "@reduxjs/toolkit";
import adminProductVideoService from "@/services/adminProductVideoService";

// Fetch active product videos (public)
export const fetchActiveProductVideos = createAsyncThunk(
  "productVideos/fetchActiveProductVideos",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await adminProductVideoService.getActiveProductVideos(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch active product videos",
      );
    }
  },
);

// Fetch all product videos (admin)

export const fetchAdminProductVideos = createAsyncThunk(
  "productVideos/fetchAdminProductVideos",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminProductVideoService.getProductVideos(params);

      console.log("Admin videos API response:", response);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product videos",
      );
    }
  },
);

// Fetch single product video
export const fetchProductVideoById = createAsyncThunk(
  "productVideos/fetchProductVideoById",
  async (videoId, { rejectWithValue }) => {
    try {
      return await adminProductVideoService.getProductVideoById(videoId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product video",
      );
    }
  },
);

// Create product video
export const createProductVideo = createAsyncThunk(
  "productVideos/createProductVideo",
  async ({ videoData, file }, { rejectWithValue }) => {
    try {
      return await adminProductVideoService.createProductVideo(videoData, file);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product video",
      );
    }
  },
);

// Update product video
export const updateProductVideo = createAsyncThunk(
  "productVideos/updateProductVideo",
  async ({ videoId, videoData }, { rejectWithValue }) => {
    try {
      return await adminProductVideoService.updateProductVideo(
        videoId,
        videoData,
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product video",
      );
    }
  },
);

// Delete product video
export const deleteProductVideo = createAsyncThunk(
  "productVideos/deleteProductVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      await adminProductVideoService.deleteProductVideo(videoId);
      return videoId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product video",
      );
    }
  },
);
