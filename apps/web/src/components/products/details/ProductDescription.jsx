
"use client";

import { FileText } from "lucide-react";

export default function ProductDescription({ description }) {
  const productDescription =
    typeof description === "string" && description.trim()
      ? description.trim()
      : "No description available for this product.";

  return (
    <section
      aria-labelledby="product-description-heading"
      className="mt-12 border-t border-[#E2E8F0] pt-8 sm:mt-16 sm:pt-10"
    >
      {/* Section Heading */}
      <div className="flex items-center gap-3">
        <div className="
          flex h-10 w-10 shrink-0 items-center
          justify-center rounded-xl
          bg-blue-50 text-[#0755e9]
        ">
          <FileText size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h2
            id="product-description-heading"
            className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl"
          >
            Product Description
          </h2>

          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Everything you need to know about this product
          </p>
        </div>
      </div>

      {/* Description Content */}
      <div className="
        mt-5 rounded-2xl border border-slate-100
        bg-slate-50/60 p-4 sm:mt-6 sm:p-6
      ">
        <p className="
          whitespace-pre-line break-words
          text-sm leading-7 text-slate-600
          sm:text-[15px] sm:leading-8
        ">
          {productDescription}
        </p>
      </div>
    </section>
  );
}
