import { createSlice } from "@reduxjs/toolkit";
import {
  cancelUserOrder,
  fetchUserOrderById,
  fetchUserOrders,
} from "../thunks/orderThunks";

const initialState = {
  orders: [],
  pagination: null,
  selectedOrder: null,
  loadingList: false,
  loadingDetails: false,
  cancellingOrderId: null,
  listError: null,
  detailsError: null,
  detailsStatusCode: null,
  cancelError: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderErrors: (state) => {
      state.listError = null;
      state.detailsError = null;
      state.cancelError = null;
    },
    clearCancelError: (state) => {
      state.cancelError = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
      state.detailsError = null;
      state.detailsStatusCode = null;
      state.loadingDetails = false;
    },
    resetOrdersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loadingList = true;
        state.listError = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loadingList = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.listError = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loadingList = false;
        state.listError =
          action.payload?.message || "Failed to load your order history.";
      })

      .addCase(fetchUserOrderById.pending, (state, action) => {
        const silent = Boolean(action.meta.arg?.silent);
        if (!silent) {
          state.loadingDetails = true;
        }
        state.detailsError = null;
        state.detailsStatusCode = null;
      })
      .addCase(fetchUserOrderById.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedOrder = action.payload;
        state.detailsError = null;
        state.detailsStatusCode = null;
      })
      .addCase(fetchUserOrderById.rejected, (state, action) => {
        state.loadingDetails = false;
        state.detailsError =
          action.payload?.message || "Unable to load order details.";
        state.detailsStatusCode = action.payload?.statusCode || null;
      })

      .addCase(cancelUserOrder.pending, (state, action) => {
        state.cancellingOrderId = action.meta.arg?.orderId || null;
        state.cancelError = null;
      })
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        state.cancellingOrderId = null;
        state.cancelError = null;

        const updatedOrder = action.payload;
        if (!updatedOrder?._id) return;

        if (state.selectedOrder?._id === updatedOrder._id) {
          state.selectedOrder = updatedOrder;
        }

        const idx = state.orders.findIndex(
          (item) => (item._id || item.id) === updatedOrder._id,
        );
        if (idx !== -1) {
          state.orders[idx] = updatedOrder;
        }
      })
      .addCase(cancelUserOrder.rejected, (state, action) => {
        state.cancellingOrderId = null;
        state.cancelError =
          action.payload?.message || "Unable to cancel this order.";
      });
  },
});

export const {
  clearOrderErrors,
  clearCancelError,
  clearSelectedOrder,
  resetOrdersState,
} = orderSlice.actions;

export const selectUserOrders = (state) => state.orders.orders;
export const selectUserOrdersPagination = (state) => state.orders.pagination;
export const selectSelectedOrder = (state) => state.orders.selectedOrder;
export const selectOrdersListLoading = (state) => state.orders.loadingList;
export const selectOrderDetailsLoading = (state) => state.orders.loadingDetails;
export const selectCancellingOrderId = (state) => state.orders.cancellingOrderId;
export const selectOrdersListError = (state) => state.orders.listError;
export const selectOrderDetailsError = (state) => state.orders.detailsError;
export const selectOrderDetailsStatusCode = (state) =>
  state.orders.detailsStatusCode;
export const selectOrderCancelError = (state) => state.orders.cancelError;

export default orderSlice.reducer;

