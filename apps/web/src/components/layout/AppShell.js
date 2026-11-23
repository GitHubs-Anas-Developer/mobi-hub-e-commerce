"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "../home/AnnouncementBar";
import BottomNavigation from "./BottomNavigation";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function AppShellContent({ children }) {
  const pathname = usePathname() || "/";

  // Admin routes
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // Authentication routes
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Admin and Authentication Layout
  if (isAdminRoute || isAuthRoute) {
    return <main className="min-h-screen flex-1 bg-white">{children}</main>;
  }

  // Store Layout
  return (
    <>
      <AnnouncementBar />

      <Navbar />

      <main className="min-h-screen flex-1 bg-white pb-20 xl:pb-0">
        {children}
      </main>

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
        <main className="min-h-screen flex-1 bg-white">{children}</main>
      }
    >
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  );
}
