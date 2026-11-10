
"use client";

import { Eye, Star, Sparkles } from "lucide-react";

const statusOptions = [
  {
    key: "isActive",
    title: "Active Product",
    description: "Make this product visible in the store.",
    icon: Eye,
  },
  {
    key: "isFeatured",
    title: "Featured Product",
    description: "Display this product in featured sections.",
    icon: Star,
  },
  {
    key: "isNewArrival",
    title: "New Arrival",
    description: "Mark this product as a new arrival.",
    icon: Sparkles,
  },
];

export default function ProductStatusSection({
  formData,
  onChange,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Product Status
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Configure product visibility and promotional status.
      </p>

      <div className="mt-6 space-y-4">
        {statusOptions.map((option) => {
          const Icon = option.icon;

          return (
            <label
              key={option.key}
              className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Icon size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {option.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {option.description}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                name={option.key}
                checked={Boolean(formData[option.key])}
                onChange={onChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
