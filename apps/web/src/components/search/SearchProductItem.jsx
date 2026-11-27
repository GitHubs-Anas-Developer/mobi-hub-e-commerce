"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, ArrowUpRight } from "lucide-react";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function SearchProductItem({
  id,
  product,
  active = false,
  onClick,
  optionRef,
}) {
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const thumbnailUrl = !imgError ? product.thumbnail?.url || "" : "";

  return (
    <button
      ref={optionRef}
      id={id}
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
        active
          ? "border-[#0755E9]/35 bg-[#EFF6FF] shadow-xs"
          : "border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC]"
      }`}
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.name || "Product"}
            fill
            sizes="48px"
            onError={() => setImgError(true)}
            className="object-contain p-1 transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <Package
            size={18}
            className="text-[#64748B]/50"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-bold ${
            active ? "text-[#082B70]" : "text-[#101828]"
          }`}
        >
          {product.name}
        </p>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {product.brand && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              {product.brand}
            </span>
          )}

          {product.basePrice !== undefined && product.basePrice !== null && (
            <span className="text-xs font-extrabold text-[#0755E9] tabular-nums">
              {formatINR(product.basePrice)}
            </span>
          )}
        </div>
      </div>

      <ArrowUpRight
        size={15}
        aria-hidden="true"
        className={`shrink-0 transition ${
          active
            ? "text-[#0755E9] opacity-100"
            : "text-[#64748B] opacity-0 group-hover:opacity-100"
        }`}
      />
    </button>
  );
}
