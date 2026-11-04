"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRoute({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isInitialized && isAuthenticated && user?.role !== "admin") {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Checking admin access...</p>
      </div>
    );
  }

  return children;
}
