import { createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "@/services/categoryService";

// Fetch active categories (Client)
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch categories",
      );
    }
  },
);

// Fetch all categories (Admin)
export const fetchAdminCategories = createAsyncThunk(
  "categories/fetchAdminCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAdminCategories(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch admin categories",
      );
    }
  },
);

// Fetch single category
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryById(categoryId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch category",
      );
    }
  },
);

export const fetchSubCategories = createAsyncThunk(
  "categories/fetchSubCategories",
  async (parentCategoryId, { rejectWithValue }) => {
    try {
      return await categoryService.getSubCategories(parentCategoryId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch subcategories",
      );
    }
  },
);
