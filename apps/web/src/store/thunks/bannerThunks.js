import { createAsyncThunk } from "@reduxjs/toolkit";
import adminBannerService from "@/services/adminBannerService";

// Fetch active banners (public)
export const fetchActiveBanners = createAsyncThunk(
  "banners/fetchActiveBanners",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await adminBannerService.getActiveBanners(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch active banners",
      );
    }
  },
);


// Fetch all banners (admin)
export const fetchAdminBanners = createAsyncThunk(
  "banners/fetchAdminBanners",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await adminBannerService.getBanners(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banners",
      );
    }
  },
);

// Fetch single banner
export const fetchBannerById = createAsyncThunk(
  "banners/fetchBannerById",
  async (bannerId, { rejectWithValue }) => {
    try {
      return await adminBannerService.getBannerById(bannerId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banner",
      );
    }
  },
);

// Create banner
export const createBanner = createAsyncThunk(
  "banners/createBanner",
  async ({ bannerData, files }, { rejectWithValue }) => {
    try {
      return await adminBannerService.createBanner(bannerData, files);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create banner",
      );
    }
  },
);

// Update banner
export const updateBanner = createAsyncThunk(
  "banners/updateBanner",
  async ({ bannerId, bannerData, files }, { rejectWithValue }) => {
    try {
      return await adminBannerService.updateBanner(bannerId, bannerData, files);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update banner",
      );
    }
  },
);

// Delete banner
export const deleteBanner = createAsyncThunk(
  "banners/deleteBanner",
  async (bannerId, { rejectWithValue }) => {
    try {
      await adminBannerService.deleteBanner(bannerId);
      return bannerId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete banner",
      );
    }
  },
);
