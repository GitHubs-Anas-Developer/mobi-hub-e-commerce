"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Tag } from "antd";

import { BRAND_ASSETS, BRAND_NAME, BRAND_TAGLINE } from "@/config/brand";
import {
  ADMIN_NAV_GROUPS,
  resolveAdminPageMeta,
} from "@/components/admin/layout/adminNavigation";

export default function AdminSidebar({ collapsed = false, onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeKey } = resolveAdminPageMeta(pathname);

  const menuItems = ADMIN_NAV_GROUPS.map((group) => ({
    type: "group",
    key: group.key,
    label: collapsed ? (
      <span className="block border-t border-[#E2E8F0] my-1" />
    ) : (
      <span className="px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
        {group.label}
      </span>
    ),
    children: group.items.map((item) => {
      const Icon = item.icon;
      return {
        key: item.href,
        icon: <Icon size={17} strokeWidth={2} />,
        label: item.label,
        title: collapsed ? item.label : undefined,
      };
    }),
  }));

  const handleMenuClick = ({ key }) => {
    router.push(key);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header */}
      <Link
        href="/admin"
        onClick={() => onNavigate?.()}
        aria-label={`${BRAND_NAME} Admin Dashboard`}
        className={`flex h-[68px] shrink-0 items-center border-b border-[#E2E8F0] transition-all ${
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-5"
        }`}
      >
        {collapsed ? (
          <Image
            src={BRAND_ASSETS.icon}
            alt={BRAND_NAME}
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        ) : (
          <>
            <Image
              src={BRAND_ASSETS.logo}
              alt={`${BRAND_NAME} - ${BRAND_TAGLINE}`}
              width={856}
              height={224}
              className="h-7 w-auto max-w-[138px] object-contain"
            />

            <Tag
              color="blue"
              className="!m-0 !border-[#0755E9]/20 !bg-[#EFF6FF] !px-2 !py-0.5 !text-[10px] !font-extrabold !uppercase !tracking-wider !text-[#0755E9]"
            >
              Admin
            </Tag>
          </>
        )}
      </Link>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto py-3">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderInlineEnd: 0 }}
        />
      </div>

      {/* Footer Card */}
      {!collapsed && (
        <div className="shrink-0 border-t border-[#E2E8F0] p-3.5">
          <div className="rounded-xl border border-[#0755E9]/15 bg-[#EFF6FF]/60 p-3">
            <p className="text-xs font-bold text-[#082B70]">
              {BRAND_NAME} Console
            </p>
            <p className="mt-0.5 text-[11px] text-[#64748B]">
              Verified store operations hub
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
