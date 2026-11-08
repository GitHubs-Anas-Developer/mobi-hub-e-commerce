"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchCurrentUser } from "@/store/thunks/authThunks";
import { fetchCart } from "@/store/thunks/cartThunks";
import { fetchWishlist } from "@/store/thunks/wishlistThunks";

import { resetCart } from "@/store/slices/cartSlice";
import { resetWishlist } from "@/store/slices/wishlistSlice";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  // Initialize authentication
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Synchronize Cart and Wishlist with authentication
  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    } else {
      dispatch(resetCart());
      dispatch(resetWishlist());
    }
  }, [dispatch, isAuthenticated, isInitialized]);

  return children;
}
