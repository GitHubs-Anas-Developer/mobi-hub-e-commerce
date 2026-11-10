
import { Star } from "lucide-react";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

export default function ProductInfo({
  product,
  selectedVariant,
  sellingPrice,
  mrp,
  discount,
}) {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-wide text-[#1D4ED8]">
        {product.brand || "MOBI HUB"}
      </p>

      <h1 className="mt-2 text-2xl font-extrabold leading-tight text-[#0F172A] sm:text-3xl">
        {product.name}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-amber-500">
          <Star size={17} fill="currentColor" />

          <span className="text-sm font-bold text-[#0F172A]">
            {Number(product.ratings?.average || 0).toFixed(1)}
          </span>
        </div>

        <span className="text-sm text-slate-400">
          ({product.ratings?.count || 0} reviews)
        </span>
      </div>

      <div className="my-6 border-t border-[#E2E8F0]" />

      {selectedVariant ? (
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-extrabold text-[#0F172A]">
              {formatPrice(sellingPrice)}
            </span>

            {mrp > sellingPrice && (
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(mrp)}
              </span>
            )}

            {discount > 0 && (
              <span className="rounded-md bg-green-50 px-2 py-1 text-sm font-bold text-green-700">
                Save {discount}%
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Inclusive of applicable taxes
          </p>
        </div>
      ) : (
        <p className="text-sm text-red-600">
          No active variants available for this product.
        </p>
      )}
    </>
  );
}
