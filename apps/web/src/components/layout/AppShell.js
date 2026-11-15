"use client";

import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "../home/AnnouncementBar";
import BottomNavigation from "./BottomNavigation";

export default function AppShell({ children }) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  // Admin Layout
  if (isAdminRoute) {
    return <main className="flex-1">{children}</main>;
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
