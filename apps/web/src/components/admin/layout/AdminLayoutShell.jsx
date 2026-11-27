"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, Drawer, Layout } from "antd";
import { Home } from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { resolveAdminPageMeta } from "./adminNavigation";

const { Sider, Content } = Layout;

export default function AdminLayoutShell({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { breadcrumbs } = resolveAdminPageMeta(pathname);

  const breadcrumbItems = [
    {
      key: "home",
      title: (
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#0755E9]"
        >
          <span>Store</span>
        </Link>
      ),
    },
    ...breadcrumbs.map((crumb, index) => ({
      key: `${crumb.label}-${index}`,
      title: crumb.href ? (
        <Link
          href={crumb.href}
          className="text-xs font-medium text-[#64748B] hover:text-[#0755E9]"
        >
          {crumb.label}
        </Link>
      ) : (
        <span className="text-xs font-semibold text-[#101828] capitalize">
          {crumb.label}
        </span>
      ),
    })),
  ];

  return (
    <Layout className="elz-admin-root min-h-screen !bg-[#F8FAFC]">
      {/* Desktop Collapsible Sider */}
      <Sider
        width={256}
        collapsedWidth={76}
        collapsed={collapsed}
        trigger={null}
        className="hidden !border-r !border-[#E2E8F0] !bg-white lg:block"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <AdminSidebar collapsed={collapsed} />
      </Sider>

      {/* Mobile Drawer Navigation */}
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{
          body: { padding: 0 },
          wrapper: { width: 268 },
        }}
        closable={false}
        className="lg:hidden"
      >
        <AdminSidebar
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      {/* Main Content Area */}
      <Layout className="min-w-0 flex-1 !bg-[#F8FAFC]">
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onOpenMobileDrawer={() => setMobileOpen(true)}
        />

        {/* Breadcrumb Strip */}
        <div className="border-b border-[#E2E8F0] bg-white px-3 py-2.5 sm:px-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Content className="w-full min-w-0 flex-1 !p-4 sm:!p-6">
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
