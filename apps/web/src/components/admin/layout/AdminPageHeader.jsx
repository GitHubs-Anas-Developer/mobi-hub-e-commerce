"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Space, Tag } from "antd";

export default function AdminPageHeader({
  title,
  subtitle,
  badge = null,
  backHref = "",
  backLabel = "Back",
  extra = null,
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-center">
      <div className="min-w-0">
        {backHref && (
          <Button
            type="link"
            onClick={() => router.push(backHref)}
            icon={<ArrowLeft size={15} />}
            className="mb-1.5 !h-auto !px-0 !text-xs !font-semibold !text-[#64748B] hover:!text-[#0755E9]"
          >
            {backLabel}
          </Button>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="!m-0 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl">
            {title}
          </h1>

          {badge && (
            <Tag
              color="blue"
              className="!m-0 !border-[#0755E9]/20 !bg-[#EFF6FF] !text-[11px] !font-bold !text-[#0755E9]"
            >
              {badge}
            </Tag>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs leading-relaxed text-[#64748B] sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {extra && (
        <Space wrap size="small" className="shrink-0">
          {extra}
        </Space>
      )}
    </div>
  );
}

