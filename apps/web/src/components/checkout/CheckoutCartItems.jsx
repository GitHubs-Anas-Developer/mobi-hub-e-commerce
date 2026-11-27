"use client";

import Image from "next/image";
import { ShoppingBag, Package } from "lucide-react";

const formatPrice = (amount) => {
  const value = Number(amount);
  return `₹${(Number.isFinite(value) ? value : 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getImageUrl = (image) => {
  if (typeof image === "string") return image;
  return image?.url || "";
};

const getCartItemDetails = (item) => {
  const product = item?.product || item?.productId || {};

  const variantId =
    typeof item?.variantId === "object"
      ? item.variantId?._id
      : item?.variantId;

  const variant =
    (typeof item?.variantId === "object" && item.variantId) ||
    product.variants?.find(
      (v) => String(v._id) === String(variantId)
    ) ||
    product.variants?.find((v) => v.isDefault) ||
    product.variants?.[0] ||
    {};

  const rawPrice =
    variant.sellingPrice ??
    item?.sellingPrice ??
    product.basePrice ??
    0;

  const sellingPrice = Number.isFinite(Number(rawPrice)) ? Number(rawPrice) : 0;
  const quantity = Math.max(0, Number(item?.quantity || 0) || 0);

  const image =
    getImageUrl(variant.images?.[0]) ||
    getImageUrl(product.thumbnail) ||
    getImageUrl(product.images?.[0]);

  return { product, variant, sellingPrice, quantity, image };
};

const getAttributesList = (attributes) => {
  if (!attributes) return [];
  if (attributes instanceof Map) return Array.from(attributes.entries());
  if (Array.isArray(attributes)) {
    return attributes
      .map((a) => (Array.isArray(a) ? a : [a?.name || a?.key, a?.value]))
      .filter(([k, v]) => k && v);
  }
  if (typeof attributes === "object") return Object.entries(attributes);
  return [];
};

export default function CheckoutCartItems({ cartItems = [] }) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#64748B]">
          <ShoppingBag size={22} />
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#101828]">
          Your checkout list is empty
        </h3>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E2E8F0]">
      {cartItems.map((item, index) => {
        const { product, variant, sellingPrice, quantity, image } =
          getCartItemDetails(item);

        const attributes = getAttributesList(variant.attributes);
        const itemTotal = sellingPrice * quantity;
        const itemKey =
          item._id ||
          `${product._id || product.slug || "product"}-${variant._id || item.variantId || index}`;

        return (
          <div key={itemKey} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] sm:h-[72px] sm:w-[72px]">
              {image ? (
                <Image
                  src={image}
                  alt={product.name || "Product"}
                  fill
                  sizes="72px"
                  className="object-contain p-1.5"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <Package size={22} />
                </div>
              )}

              <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border border-white bg-[#0755E9] px-1 text-[10px] font-bold text-white tabular-nums">
                {quantity}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {product.brand && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      {product.brand}
                    </p>
                  )}
                  <h4 className="line-clamp-2 text-xs font-bold leading-snug text-[#101828] sm:text-sm">
                    {product.name || item.name || "Product"}
                  </h4>
                </div>

                <span className="shrink-0 text-xs font-extrabold text-[#101828] tabular-nums sm:text-sm">
                  {formatPrice(itemTotal)}
                </span>
              </div>

              {attributes.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {attributes.map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-medium text-[#64748B]"
                    >
                      <span className="capitalize">{key}:</span> {String(value)}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-1 text-[11px] text-[#64748B] tabular-nums">
                {quantity} × {formatPrice(sellingPrice)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
