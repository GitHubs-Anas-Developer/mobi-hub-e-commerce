import searchService from "@/services/searchService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSearchSuggestions = createAsyncThunk(
  "search/fetchSuggestions",
  async (query, { rejectWithValue }) => {
    try {
      return await searchService.getSuggestions(query);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch suggestions",
      );
    }
  },
);
