"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "../home/AnnouncementBar";
import BottomNavigation from "./BottomNavigation";

function AppShellContent({ children }) {
  const pathname = usePathname();

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // Authentication routes
  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Admin and Authentication Layout
  if (isAdminRoute || isAuthRoute) {
    return <main className="flex-1 min-h-screen bg-white">{children}</main>;
  }

  // Store Layout
  return (
    <>
      <AnnouncementBar />

      <Navbar />

      <main className="flex-1 pb-20 xl:pb-0 bg-white">{children}</main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}

export default function AppShell({ children }) {
  return (
    <Suspense
      fallback={
        <main className="flex-1 min-h-screen bg-white">{children}</main>
      }
    >
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  );
}
