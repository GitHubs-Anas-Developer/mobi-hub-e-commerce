"use client";

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

      <main className="min-h-screen flex-1 bg-white ">
        {children}
      </main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}

export default function AppShell({ children }) {
  return <AppShellContent>{children}</AppShellContent>;
}
