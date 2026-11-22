import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCategories,
  fetchAdminCategories,
  fetchCategoryById,
  fetchSubCategories,
} from "../thunks/categoryThunks";

const initialState = {
  categories: [],
  adminCategories: [],
  subCategories: [],
  selectedCategory: null,

  loading: false,
  adminLoading: false,
  detailLoading: false,
  subCategoriesLoading: false,

  error: null,
  subCategoriesError: null,
};

const getCategories = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }
  return [];
};

const categorySlice = createSlice({
  name: "categories",
  initialState,

  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },

    clearSubCategoriesError: (state) => {
      state.subCategoriesError = null;
    },

    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },

    resetCategories: (state) => {
      state.categories = [];
      state.adminCategories = [];
      state.subCategories = [];
      state.selectedCategory = null;
      state.error = null;
      state.subCategoriesError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch active categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = getCategories(action.payload);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch admin categories
      .addCase(fetchAdminCategories.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminCategories = getCategories(action.payload);
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })

      // Fetch single category
      .addCase(fetchCategoryById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedCategory =
          action.payload?.category || action.payload?.data || action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Fetch subcategories
      .addCase(fetchSubCategories.pending, (state) => {
        state.subCategoriesLoading = true;
        state.subCategoriesError = null;
        state.subCategories = [];
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subCategoriesLoading = false;
        state.subCategories = getCategories(action.payload);
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.subCategoriesLoading = false;
        state.subCategoriesError = action.payload;
      });
  },
});

export const {
  clearCategoryError,
  clearSubCategoriesError,
  clearSelectedCategory,
  resetCategories,
} = categorySlice.actions;

export default categorySlice.reducer;
