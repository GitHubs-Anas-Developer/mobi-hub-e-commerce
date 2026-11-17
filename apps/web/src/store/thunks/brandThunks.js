import { createAsyncThunk } from "@reduxjs/toolkit";
import brandService from "@/services/brandService";


export const fetchBrands = createAsyncThunk(
  "brand/fetchBrands",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrands(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands",
      );
    }
  },
);
