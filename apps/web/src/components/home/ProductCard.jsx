
"use client";

import Link from "next/link";
import {
  Package,
  ArrowUpRight,
  Star,
} from "lucide-react";

import formatPrice from "@/utils/formatPrice";

export default function ProductCard({ product }) {
  const imageUrl =
    product.thumbnail?.url || product.images?.[0]?.url;

  const variant = product.variants?.[0];

  const price =
    product.basePrice ?? variant?.sellingPrice ?? 0;

  const mrp = variant?.mrp ?? 0;

  const discount =
    mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const rating =
    product.ratings?.count > 0
      ? product.ratings.average?.toFixed(1)
      : null;

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-[22px] border border-slate-200/70 bg-white p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)] sm:p-3">

      {/* Image Panel */}
      <div className="relative overflow-hidden ">

        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="flex aspect-square items-center justify-center p-4 sm:p-5 lg:p-6"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <Package
              size={44}
              strokeWidth={1.2}
              className="text-slate-300"
            />
          )}
        </Link>

        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold text-[#0755E9] shadow-sm sm:left-3 sm:top-3">
            {discount}% OFF
          </span>
        )}

        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0755E9] shadow-sm transition-all duration-300 hover:bg-[#0755E9] hover:text-white"
        >
          <ArrowUpRight size={17} />
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex min-w-0 flex-1 flex-col px-1 pt-3">

        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.13em] text-[#0755E9]">
            {product.brand || "MOBI HUB"}
          </span>

          {rating !== null && (
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-slate-600">
              <Star size={12} fill="#FBBF24" stroke="#FBBF24" />
              {rating}
            </span>
          )}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-[#101828] transition-colors group-hover:text-[#0755E9] sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-base font-extrabold tracking-tight text-[#101828] sm:text-lg">
              {formatPrice(price)}
            </span>

            {mrp > price && (
              <span className="text-[10px] font-medium text-slate-400 line-through sm:text-xs">
                {formatPrice(mrp)}
              </span>
            )}
          </div>

          {discount > 0 && (
            <p className="mt-1 text-[10px] font-semibold text-emerald-600 sm:text-xs">
              Save {formatPrice(mrp - price)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
