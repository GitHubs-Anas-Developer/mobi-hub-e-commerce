import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminDashboardData,
  fetchAdminQuickOrder,
} from "../thunks/adminThunks";

const initialState = {
  dashboard: {
    overview: null,
    sales: [],
    monthlySales: [],
    recentOrders: [],
    topProducts: [],
    lowStockProducts: [],
    orderStats: {},
    paymentStats: [],
    recentCustomers: [],
    recentReviews: [],
  },
  dashboardLoading: false,
  dashboardError: null,
  quickOrder: null,
  quickOrderLoading: false,
  quickOrderError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearQuickOrder: (state) => {
      state.quickOrder = null;
      state.quickOrderError = null;
      state.quickOrderLoading = false;
    },
    clearAdminErrors: (state) => {
      state.dashboardError = null;
      state.quickOrderError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
        state.dashboardError = null;
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError =
          action.payload || "Unable to load dashboard data.";
      })

      .addCase(fetchAdminQuickOrder.pending, (state) => {
        state.quickOrderLoading = true;
        state.quickOrderError = null;
      })
      .addCase(fetchAdminQuickOrder.fulfilled, (state, action) => {
        state.quickOrderLoading = false;
        state.quickOrder = action.payload;
        state.quickOrderError = null;
      })
      .addCase(fetchAdminQuickOrder.rejected, (state, action) => {
        state.quickOrderLoading = false;
        state.quickOrderError =
          action.payload || "Unable to load order details.";
      });
  },
});

export const { clearQuickOrder, clearAdminErrors } = adminSlice.actions;

export const selectAdminDashboard = (state) => state.admin.dashboard;
export const selectAdminDashboardLoading = (state) =>
  state.admin.dashboardLoading;
export const selectAdminDashboardError = (state) =>
  state.admin.dashboardError;
export const selectAdminQuickOrder = (state) => state.admin.quickOrder;
export const selectAdminQuickOrderLoading = (state) =>
  state.admin.quickOrderLoading;

export default adminSlice.reducer;

