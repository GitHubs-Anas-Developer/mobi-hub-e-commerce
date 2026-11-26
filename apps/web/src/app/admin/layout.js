import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayoutShell from "@/components/admin/layout/AdminLayoutShell";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminGuard>
  );
}
