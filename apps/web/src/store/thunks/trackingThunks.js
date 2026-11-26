import { createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "@/services/orderService";

// ==========================================
// Fetch Customer Order Tracking
// ==========================================

export const fetchOrderTracking = createAsyncThunk(
  "tracking/fetchOrderTracking",

  async (orderId, { rejectWithValue }) => {
    try {
      if (!orderId) {
        return rejectWithValue("Order ID is required");
      }

      const response = await orderService.getOrderTracking(orderId);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch order tracking",
      );
    }
  },
);
