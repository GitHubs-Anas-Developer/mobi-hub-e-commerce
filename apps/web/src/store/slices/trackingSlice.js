import { createSlice } from "@reduxjs/toolkit";
import { fetchOrderTracking } from "../thunks/trackingThunks";

// ==========================================
// Initial State
// ==========================================

const initialState = {
  tracking: null,
  loading: false,
  error: null,
  success: false,
};

// ==========================================
// Tracking Slice
// ==========================================

const trackingSlice = createSlice({
  name: "tracking",
  initialState,

  reducers: {
    // Clear tracking data
    clearTracking: (state) => {
      state.tracking = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },

    // Clear error
    clearTrackingError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================
      // Pending
      // ======================================

      .addCase(fetchOrderTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      // ======================================
      // Fulfilled
      // ======================================

      .addCase(fetchOrderTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.tracking = action.payload;
        state.success = true;
        state.error = null;
      })

      // ======================================
      // Rejected
      // ======================================

      .addCase(fetchOrderTracking.rejected, (state, action) => {
        state.loading = false;
        state.tracking = null;
        state.success = false;
        state.error = action.payload || "Failed to fetch order tracking";
      });
  },
});

// ==========================================
// Actions
// ==========================================

export const { clearTracking, clearTrackingError } = trackingSlice.actions;

// ==========================================
// Selectors
// ==========================================

export const selectOrderTracking = (state) => state.tracking.tracking;

export const selectTrackingLoading = (state) => state.tracking.loading;

export const selectTrackingError = (state) => state.tracking.error;

export const selectTrackingSuccess = (state) => state.tracking.success;

// ==========================================
// Export Reducer
// ==========================================

export default trackingSlice.reducer;
