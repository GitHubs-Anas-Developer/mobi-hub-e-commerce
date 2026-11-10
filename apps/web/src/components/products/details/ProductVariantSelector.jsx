
function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

export default function ProductVariantSelector({
  variants = [],
  selectedVariantId,
  onVariantChange,
}) {
  if (variants.length === 0) return null;

  return (
    <div className="mt-7">
      <h2 className="mb-3 text-sm font-bold text-[#0F172A]">
        Choose Variant
      </h2>

      <div className="space-y-3">
        {variants.map((variant) => {
          const attributes = Object.entries(
            variant.attributes instanceof Map
              ? Object.fromEntries(variant.attributes)
              : variant.attributes || {},
          );

          const label =
            attributes.length > 0
              ? attributes
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(" / ")
              : variant.sku;

          return (
            <button
              key={variant._id}
              type="button"
              onClick={() => onVariantChange(variant._id)}
              aria-pressed={selectedVariantId === variant._id}
              className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
                selectedVariantId === variant._id
                  ? "border-[#1D4ED8] bg-blue-50"
                  : "border-[#E2E8F0] hover:border-blue-300"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  {label}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  SKU: {variant.sku}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-[#0F172A]">
                  {formatPrice(variant.sellingPrice)}
                </p>

                <p
                  className={`mt-1 text-xs ${
                    variant.stock > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {variant.stock > 0
                    ? `${variant.stock} available`
                    : "Out of stock"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
