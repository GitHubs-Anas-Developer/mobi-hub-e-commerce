"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BRAND_ASSETS, BRAND_NAME } from "@/config/brand";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  const { isAuthenticated, isInitialized } = useAuth();

  const [mounted, setMounted] = useState(false);

  // Ensure client-side hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (mounted && isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isInitialized, isAuthenticated, router]);

  // Authentication initialization loading
  if (!mounted || !isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-white">
        <div className="flex flex-col items-center text-center">
          <img
            src={BRAND_ASSETS.icon}
            alt={BRAND_NAME}
            className="mb-4 h-11 w-11 object-contain"
          />

          <div className="relative h-9 w-9">
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-100" />

            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#0755E9]" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  // Redirect loading
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-white">
        <div className="flex flex-col items-center text-center">
          <img
            src={BRAND_ASSETS.icon}
            alt={BRAND_NAME}
            className="mb-4 h-11 w-11 object-contain"
          />

          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-100 border-t-[#0755E9]" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
}
