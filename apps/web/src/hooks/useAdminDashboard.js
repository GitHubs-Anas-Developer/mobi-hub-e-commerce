"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAdminDashboard,
  selectAdminDashboardError,
  selectAdminDashboardLoading,
} from "@/store/slices/adminSlice";
import { fetchAdminDashboardData } from "@/store/thunks/adminThunks";

export default function useAdminDashboard(period = "7d") {
  const dispatch = useDispatch();
  const data = useSelector(selectAdminDashboard);
  const loading = useSelector(selectAdminDashboardLoading);
  const error = useSelector(selectAdminDashboardError);

  const refreshDashboard = useCallback(() => {
    return dispatch(fetchAdminDashboardData(period));
  }, [dispatch, period]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    data,
    loading,
    error,
    refreshDashboard,
  };
}
