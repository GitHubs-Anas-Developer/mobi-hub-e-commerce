"use client";

import { useCallback, useEffect, useState } from "react";
import adminOrderService from "@/services/adminOrderService";

export default function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    paymentStatus: "all",
    search: "",
    startDate: "",
    endDate: "",
    sort: "newest",
    page: 1,
    limit: 10,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      };

      if (filters.status !== "all") {
        params.status = filters.status;
      }

      if (filters.paymentStatus !== "all") {
        params.paymentStatus = filters.paymentStatus;
      }

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await adminOrderService.getOrders(params);

      setOrders(response.data?.orders || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.paymentStatus,
    filters.startDate,
    filters.endDate,
    filters.sort,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update filters and reset pagination
  const updateFilters = useCallback((updates) => {
    setFilters((previous) => ({
      ...previous,
      ...updates,
      page: 1,
    }));
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      await adminOrderService.updateOrderStatus(orderId, orderStatus);

      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status");
      throw err;
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      await adminOrderService.updatePaymentStatus(orderId, paymentStatus);

      await fetchOrders();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update payment status",
      );
      throw err;
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return {
    orders,
    pagination,
    filters,
    setFilters,
    updateFilters,
    loading,
    error,
    updatingOrderId,
    refreshOrders: fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
  };
}
