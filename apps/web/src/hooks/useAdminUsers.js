"use client";

import { useCallback, useEffect, useState } from "react";
import adminUserService from "@/services/adminUserService";

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    verification: "all",
    sort: "newest",
    page: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Fetch customers
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminUserService.getUsers(filters);

      setUsers(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update customer status
  const updateUserStatus = async (userId, isActive) => {
    try {
      setUpdatingUserId(userId);
      setError("");

      await adminUserService.updateUserStatus(userId, isActive);

      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
      throw err;
    } finally {
      setUpdatingUserId(null);
    }
  };

  return {
    users,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    updatingUserId,
    refreshUsers: fetchUsers,
    updateUserStatus,
  };
}
