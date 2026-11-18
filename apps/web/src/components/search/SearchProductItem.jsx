
"use client";

import Image from "next/image";

export default function SearchProductItem({
  product,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
        active ? "bg-blue-50" : "hover:bg-slate-50"
      }`}
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white">
        {product.thumbnail?.url ? (
          <Image
            src={product.thumbnail.url}
            alt={product.name}
            fill
            sizes="56px"
            className="object-contain p-1"
          />
        ) : (
          <span className="text-xs text-slate-300">No image</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {product.name}
        </p>

        <p className="mt-1 text-sm font-semibold text-blue-600">
          ₹{Number(product.basePrice || 0).toLocaleString("en-IN")}
        </p>

        {product.brand && (
          <p className="mt-0.5 text-xs text-slate-400">
            {product.brand}
          </p>
        )}
      </div>
    </button>
  );
}
