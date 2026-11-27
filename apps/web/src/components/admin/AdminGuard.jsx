"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import { BRAND_ASSETS, BRAND_NAME } from "@/config/brand";

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC] p-6">
        <img
          src={BRAND_ASSETS.icon}
          alt={BRAND_NAME}
          className="h-12 w-12 object-contain"
        />
        <Spin size="medium" />
        <p className="text-sm font-medium text-[#64748B]">
          Verifying admin session...
        </p>
      </div>
    );
  }

  return children;
}
