
"use client";

import Image from "next/image";
import Link from "next/link";

export default function RecentlyViewedCard({ product }) {
  if (!product) return null;

  const price =
    product.basePrice ??
    product.variants?.[0]?.sellingPrice ??
    0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product.thumbnail?.url && (
          <Image
            src={product.thumbnail.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            className="object-contain p-4 transition duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="p-3">
        <p className="mb-1 text-xs text-slate-500">
          {product.brand}
        </p>

        <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-slate-800">
          {product.name}
        </h3>

        <p className="mt-2 font-bold text-[#0755e9]">
          ₹{Number(price).toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}
