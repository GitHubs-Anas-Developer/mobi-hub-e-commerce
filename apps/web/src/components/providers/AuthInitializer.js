"use client";

import { fetchCurrentUser } from "@/store/thunks/authThunks";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return children;
}
