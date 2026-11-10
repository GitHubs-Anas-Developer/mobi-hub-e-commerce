
"use client";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getCartItemDetails = (item) => {
  const product = item.product || item.productId || {};

  const variantId =
    typeof item.variantId === "object"
      ? item.variantId?._id
      : item.variantId;

  const variant =
    (typeof item.variantId === "object" && item.variantId) ||
    product.variants?.find(
      (variant) => String(variant._id) === String(variantId)
    ) ||
    product.variants?.find((variant) => variant.isDefault) ||
    product.variants?.[0] ||
    {};

  const sellingPrice = Number(
    variant.sellingPrice ??
      item.sellingPrice ??
      product.basePrice ??
      0
  );

  const quantity = Number(item.quantity || 0);

  const getImageUrl = (image) => {
    if (typeof image === "string") return image;
    return image?.url || "";
  };

  return {
    product,
    variant,
    sellingPrice,
    quantity,
    image:
      getImageUrl(variant.images?.[0]) ||
      getImageUrl(product.thumbnail) ||
      getImageUrl(product.images?.[0]),
  };
};

export default function CheckoutCartItems({
  cartItems = [],
}) {
  if (!cartItems.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">
          No products in your cart.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cartItems.map((item) => {
        const {
          product,
          variant,
          sellingPrice,
          quantity,
          image,
        } = getCartItemDetails(item);

        const attributes =
          variant.attributes &&
          typeof variant.attributes === "object"
            ? Object.entries(variant.attributes)
            : [];

        return (
          <div
            key={item._id || product._id}
            className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            {/* Product Image */}
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {image ? (
                <img
                  src={image}
                  alt={product.name || "Product"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No Image
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                {product.name || item.name || "Product"}
              </h3>

              {product.brand && (
                <p className="mt-1 text-xs text-slate-500">
                  {product.brand}
                </p>
              )}

              {attributes.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {attributes
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" | ")}
                </p>
              )}

              {variant.sku && (
                <p className="mt-1 text-xs text-slate-500">
                  SKU: {variant.sku}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Quantity: {quantity}
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {formatPrice(sellingPrice * quantity)}
              </p>
            </div>

            {/* Unit Price */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-slate-900">
                {formatPrice(sellingPrice)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Per item
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
