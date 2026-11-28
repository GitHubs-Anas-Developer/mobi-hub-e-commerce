import { Suspense } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import AdminLayoutShell from "@/components/admin/layout/AdminLayoutShell";

export const metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

function AdminLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm font-medium text-[#64748B]">
      Loading admin workspace...
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AntdRegistry>
        <AdminGuard>
          <AdminThemeProvider>
            <AdminLayoutShell>{children}</AdminLayoutShell>
          </AdminThemeProvider>
        </AdminGuard>
      </AntdRegistry>
    </Suspense>
  );
}
