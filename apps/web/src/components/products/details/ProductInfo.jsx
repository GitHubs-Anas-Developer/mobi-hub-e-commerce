
import {
  Star,
  BadgeCheck,
  Tag,
  PackageCheck,
} from "lucide-react";

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
  const rating = Number(product.ratings?.average || 0);
  const reviewCount = Number(product.ratings?.count || 0);

  const savings = Math.max(
    0,
    Number(mrp || 0) - Number(sellingPrice || 0)
  );

  return (
    <section className="w-full">

      {/* Brand & Availability */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0755e9]">
          {product.brand || "MOBI HUB"}
        </span>

        {selectedVariant && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <BadgeCheck size={14} />
            Genuine Product
          </span>
        )}
      </div>

      {/* Product Name */}
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#101828] sm:text-3xl lg:text-[34px]">
        {product.name}
      </h1>

      {/* Rating & Product ID */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-600">
            <Star size={15} fill="currentColor" />
            <span className="text-sm font-bold">
              {rating.toFixed(1)}
            </span>
          </div>

          <span className="text-xs text-slate-500">
            {reviewCount} Reviews
          </span>
        </div>

        {product.sku && (
          <>
            <span className="h-4 w-px bg-slate-200" />

            <span className="text-xs text-slate-500">
              SKU:{" "}
              <span className="font-semibold text-slate-700">
                {product.sku}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-slate-200" />

      {/* Price Section */}
      {selectedVariant ? (
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 sm:p-5">

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Special Price
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">

            <span className="text-3xl font-extrabold tracking-tight text-[#101828] sm:text-4xl">
              {formatPrice(sellingPrice)}
            </span>

            {mrp > sellingPrice && (
              <span className="text-lg font-medium text-slate-400 line-through">
                {formatPrice(mrp)}
              </span>
            )}

            {discount > 0 && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Savings */}
          {savings > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
              <Tag size={16} />
              You save {formatPrice(savings)}
            </div>
          )}

          {/* Tax Information */}
          <p className="mt-3 text-xs text-slate-500">
            Inclusive of applicable taxes
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            No active variants available for this product.
          </p>
        </div>
      )}

      {/* Product Assurance */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <PackageCheck size={16} className="shrink-0 text-[#0755e9]" />
        <span>Quality checked products from Mobi Hub</span>
      </div>

    </section>
  );
}
