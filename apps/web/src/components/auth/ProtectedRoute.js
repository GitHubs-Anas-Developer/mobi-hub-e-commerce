
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  const { isAuthenticated, isInitialized } = useAuth();

  const [mounted, setMounted] = useState(false);

  // Run only after hydration.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isInitialized, isAuthenticated, router]);

  // Same HTML during server rendering and initial client rendering.
  if (!mounted || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return children;
}
