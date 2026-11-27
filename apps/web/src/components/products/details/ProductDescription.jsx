"use client";

import { FileText } from "lucide-react";

export default function ProductDescription({
  description,
  embedded = false,
}) {
  const productDescription =
    typeof description === "string" && description.trim()
      ? description.trim()
      : "";

  if (!productDescription) return null;

  if (embedded) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6">
        <p className="whitespace-pre-line break-words text-sm leading-7 text-[#64748B] sm:text-[15px] sm:leading-8">
          {productDescription}
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="product-description-heading">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
          <FileText size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h2
            id="product-description-heading"
            className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl"
          >
            Product Description
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B] sm:text-sm">
            Everything you need to know about this product
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:mt-6 sm:p-6">
        <p className="whitespace-pre-line break-words text-sm leading-7 text-[#64748B] sm:text-[15px] sm:leading-8">
          {productDescription}
        </p>
      </div>
    </section>
  );
}
