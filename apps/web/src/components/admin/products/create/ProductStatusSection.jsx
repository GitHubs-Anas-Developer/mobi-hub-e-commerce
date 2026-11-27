"use client";

import { Card, Switch } from "antd";
import { Eye, Sparkles, Star } from "lucide-react";

const statusOptions = [
  {
    key: "isActive",
    title: "Active Product",
    description: "Make this product visible across storefront search and catalog.",
    icon: Eye,
  },
  {
    key: "isFeatured",
    title: "Featured Product",
    description: "Highlight this product inside featured storefront sections.",
    icon: Star,
  },
  {
    key: "isNewArrival",
    title: "New Arrival",
    description: "Tag this item in New Arrivals carousels.",
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
      className="!border-[#E2E8F0]"
      title={
        <div>
          <h3 className="!m-0 text-base font-bold text-[#101828]">
            Visibility & Flags
          </h3>
          <p className="mt-0.5 text-xs font-normal text-[#64748B]">
            Configure storefront listing and merchandising placement.
          </p>
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
              className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] p-3.5 transition hover:border-[#0755E9]/35"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#EFF6FF] p-2 text-[#0755E9]">
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#101828]">
                    {option.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {option.description}
                  </p>
                </div>
              </div>

              <Switch
                checked={checked}
                onChange={(next) => handleToggle(option.key, next)}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
