"use client";

import { Card, Switch, Tag } from "antd";
import { Eye, Sparkles, Star } from "lucide-react";

const statusOptions = [
  {
    key: "isActive",
    title: "Published Visibility",
    activeHint: "Live on Storefront",
    inactiveHint: "Saved as Draft",
    description:
      "Active products appear in storefront search, category pages, and feeds. Turn off to save as a draft.",
    icon: Eye,
  },
  {
    key: "isFeatured",
    title: "Featured Product",
    activeHint: "Featured",
    inactiveHint: "Standard",
    description:
      "Highlight this item in curated featured collections across ELENZO.",
    icon: Star,
  },
  {
    key: "isNewArrival",
    title: "New Arrival",
    activeHint: "New Badge",
    inactiveHint: "Standard",
    description:
      "Showcase this product in New Arrivals sections and promotional banners.",
    icon: Sparkles,
  },
];

export default function ProductStatusSection({ formData, onChange }) {
  const handleToggle = (key, checked) => {
    onChange({
      target: {
        name: key,
        type: "checkbox",
        checked,
      },
    });
  };

  return (
    <Card
      className="!border-[#E2E8F0] shadow-xs"
      title={
        <div className="flex items-center justify-between gap-2 py-0.5">
          <div>
            <h2 className="!m-0 text-base font-bold text-[#101828]">
              Product Status & Visibility
            </h2>
            <p className="mt-0.5 text-xs font-normal text-[#64748B]">
              Control publishing status and storefront badges.
            </p>
          </div>
          <Tag color={formData.isActive ? "success" : "default"}>
            {formData.isActive ? "Active" : "Draft"}
          </Tag>
        </div>
      }
    >
      <div className="space-y-3">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const checked = Boolean(formData[option.key]);

          return (
            <div
              key={option.key}
              className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 transition ${
                checked
                  ? "border-[#0755E9]/30 bg-[#EFF6FF]/40"
                  : "border-[#E2E8F0] bg-white"
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                  <Icon size={16} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#101828]">
                      {option.title}
                    </p>
                    <span className="text-[11px] font-medium text-[#64748B]">
                      ({checked ? option.activeHint : option.inactiveHint})
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">
                    {option.description}
                  </p>
                </div>
              </div>

              <Switch
                checked={checked}
                onChange={(next) => handleToggle(option.key, next)}
                aria-label={option.title}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
