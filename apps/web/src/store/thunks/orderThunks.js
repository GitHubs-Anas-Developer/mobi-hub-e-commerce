import { createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "@/services/orderService";

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      const data = response?.data || {};
      const orders = Array.isArray(data.orders)
        ? data.orders
        : Array.isArray(data)
          ? data
          : [];

      return {
        orders,
        pagination: data.pagination || null,
      };
    } catch (error) {
      return rejectWithValue({
        message: extractErrorMessage(error, "Failed to load your order history."),
        statusCode: error?.response?.status || null,
      });
    }
  },
);

export const fetchUserOrderById = createAsyncThunk(
  "orders/fetchUserOrderById",
  async (arg, { rejectWithValue }) => {
    try {
      const orderId = typeof arg === "string" ? arg : arg?.orderId;

      if (!orderId) {
        return rejectWithValue({
          message: "Order ID is required.",
          statusCode: 400,
        });
      }

      const response = await orderService.getOrderById(orderId);
      const orderData = response?.data?.data || response?.data || response;

      if (!orderData?._id) {
        return rejectWithValue({
          message: "Order details are unavailable.",
          statusCode: 404,
        });
      }

      return orderData;
    } catch (error) {
      return rejectWithValue({
        message: extractErrorMessage(error, "Unable to load order details."),
        statusCode: error?.response?.status || null,
      });
    }
  },
);

export const cancelUserOrder = createAsyncThunk(
  "orders/cancelUserOrder",
  async ({ orderId, reason, comment = "" }, { rejectWithValue }) => {
    try {
      if (!orderId) {
        return rejectWithValue({
          message: "Invalid order. Please refresh and try again.",
          statusCode: 400,
        });
      }

      const response = await orderService.cancelOrder(orderId, {
        reason,
        comment,
      });
      const updatedOrder = response?.data?.data || response?.data || response;

      return updatedOrder;
    } catch (error) {
      return rejectWithValue({
        message: extractErrorMessage(error, "Unable to cancel this order."),
        statusCode: error?.response?.status || null,
      });
    }
  },
);
