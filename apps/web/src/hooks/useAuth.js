"use client";

import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();

  const { user, isAuthenticated, isLoading, isInitialized, error } =
    useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    dispatch,
  };
};
