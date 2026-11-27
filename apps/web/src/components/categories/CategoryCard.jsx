"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Package, Layers3 } from "lucide-react";

export function getCategoryImageUrl(category) {
  if (!category) return "";
  if (typeof category.image === "string") return category.image.trim();
  return (
    category.image?.url ||
    category.image?.secure_url ||
    category.thumbnail?.url ||
    ""
  );
}

export default function CategoryCard({
  category,
  href,
  subcategoryCount = 0,
  compact = false,
}) {
  const [imageError, setImageError] = useState(false);

  if (!category) return null;

  const imageUrl = !imageError ? getCategoryImageUrl(category) : "";
  const categoryName = category.name || "Category";
  const categoryHref =
    href || (category._id ? `/categories/${category._id}` : "/categories");

  return (
    <Link
      href={categoryHref}
      aria-label={`Explore ${categoryName}`}
      className={`group flex h-full min-w-0 flex-col rounded-2xl border border-[#E2E8F0] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0755E9]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 ${
        compact ? "p-2.5 sm:p-3.5" : "p-3 sm:p-4"
      }`}
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={categoryName}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
            unoptimized
            onError={() => setImageError(true)}
            className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105 sm:p-5"
          />
        ) : (
          <Package
            size={42}
            strokeWidth={1.2}
            className="text-slate-300"
            aria-hidden="true"
          />
        )}

        {subcategoryCount > 0 && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-[#0755E9]/20 bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[#0755E9] shadow-xs">
            <Layers3 size={10} aria-hidden="true" />
            {subcategoryCount}
          </span>
        )}

        <span className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0755E9] shadow-xs transition-all duration-200 group-hover:border-[#0755E9] group-hover:bg-[#0755E9] group-hover:text-white">
          <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <div className="mb-2 h-0.5 w-7 rounded-full bg-[#0755E9] transition-all duration-200 group-hover:w-12" />

        <h3 className="line-clamp-1 text-sm font-extrabold tracking-tight text-[#101828] transition-colors group-hover:text-[#0755E9] sm:text-base">
          {categoryName}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748B]">
          {category.description || "Browse curated electronics and accessories"}
        </p>

        <span className="mt-auto inline-flex items-center gap-1 pt-2.5 text-[11px] font-bold text-[#0755E9]">
          Explore collection
          <ArrowUpRight size={12} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
