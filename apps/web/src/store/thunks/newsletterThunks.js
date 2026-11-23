import { createAsyncThunk } from "@reduxjs/toolkit";
import newsletterService from "@/services/newsletterService";

export const subscribeNewsletter = createAsyncThunk(
  "newsletter/subscribe",
  async (email, { rejectWithValue }) => {
    try {
      const response = await newsletterService.subscribeNewsletter(email);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to subscribe. Please try again.",
      );
    }
  },
);
