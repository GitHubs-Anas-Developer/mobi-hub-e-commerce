"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function AdminGuard({ children }) {
  const router = useRouter();

  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [user, isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Verifying admin access...
        </p>
      </div>
    );
  }

  return children;
}