
"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  Hash,
} from "lucide-react";
import Image from "next/image";

/* =====================================
   PRICE FORMATTER
===================================== */

const formatPrice = (amount) => {
  const value = Number(amount);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
};

/* =====================================
   IMAGE URL HELPER
===================================== */

const getImageUrl = (image) => {
  if (typeof image === "string") return image;

  return image?.url || "";
};

/* =====================================
   CART ITEM DETAILS
===================================== */

const getCartItemDetails = (item) => {
  const product = item?.product || item?.productId || {};

  const variantId =
    typeof item?.variantId === "object"
      ? item.variantId?._id
      : item?.variantId;

  const variant =
    (typeof item?.variantId === "object" &&
      item.variantId) ||
    product.variants?.find(
      (variant) =>
        String(variant._id) === String(variantId)
    ) ||
    product.variants?.find(
      (variant) => variant.isDefault
    ) ||
    product.variants?.[0] ||
    {};

  const rawPrice =
    variant.sellingPrice ??
    item?.sellingPrice ??
    product.basePrice ??
    0;

  const price = Number(rawPrice);

  const sellingPrice = Number.isFinite(price)
    ? price
    : 0;

  const rawQuantity = Number(item?.quantity || 0);

  const quantity = Number.isFinite(rawQuantity)
    ? rawQuantity
    : 0;

  const image =
    getImageUrl(variant.images?.[0]) ||
    getImageUrl(product.thumbnail) ||
    getImageUrl(product.images?.[0]);

  return {
    product,
    variant,
    sellingPrice,
    quantity,
    image,
  };
};

/* =====================================
   ATTRIBUTE VALUE FORMATTER
===================================== */

const formatAttributeValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.label ||
      value.value ||
      ""
    );
  }

  return String(value);
};

/* =====================================
   CHECKOUT CART ITEMS
===================================== */

export default function CheckoutCartItems({
  cartItems = [],
}) {
  /* EMPTY CART */

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <ShoppingBag size={26} />
        </div>

        <h3 className="mt-4 text-sm font-bold text-[#101828]">
          Your cart is empty
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          No products in your cart.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {cartItems.map((item, index) => {
        const {
          product,
          variant,
          sellingPrice,
          quantity,
          image,
        } = getCartItemDetails(item);

        const attributes =
          variant.attributes &&
          typeof variant.attributes === "object" &&
          !Array.isArray(variant.attributes)
            ? Object.entries(variant.attributes)
            : [];

        const itemTotal = sellingPrice * quantity;

        const itemKey =
          item._id ||
          `${product._id || product.slug || product.name || "product"}-${variant._id || item.variantId || index}`;

        return (
          <motion.div
            key={itemKey}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.25,
              delay: index * 0.05,
            }}
            className="group rounded-2xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-blue-200 hover:shadow-sm sm:p-4"
          >
            <div className="flex gap-3 sm:gap-4">

              {/* PRODUCT IMAGE */}

              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:h-28 sm:w-28">

                {image ? (
                  <Image
                    src={image}
                    alt={product.name || "Product"}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
                    <Package size={23} />

                    <span className="text-[10px]">
                      No Image
                    </span>
                  </div>
                )}

                {/* QUANTITY BADGE */}

                <span className="absolute bottom-1.5 right-1.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-md bg-white px-1.5 text-[11px] font-bold text-[#0755E9] shadow-sm">
                  {quantity}x
                </span>

              </div>

              {/* PRODUCT DETAILS */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-col justify-between gap-2 sm:flex-row">

                  <div className="min-w-0">

                    {product.brand && (
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#0755E9]">
                        {product.brand}
                      </p>
                    )}

                    <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#101828] sm:text-[15px]">
                      {product.name ||
                        item.name ||
                        "Product"}
                    </h3>

                  </div>

                  {/* DESKTOP UNIT PRICE */}

                  <div className="hidden shrink-0 text-right sm:block">

                    <p className="text-sm font-bold text-[#101828]">
                      {formatPrice(sellingPrice)}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Per item
                    </p>

                  </div>

                </div>

                {/* VARIANT ATTRIBUTES */}

                {attributes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">

                    {attributes.map(([key, value]) => {
                      const formattedValue =
                        formatAttributeValue(value);

                      if (!formattedValue) return null;

                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-600"
                        >
                          <span className="font-semibold capitalize">
                            {key}:
                          </span>

                          {formattedValue}
                        </span>
                      );
                    })}

                  </div>
                )}

                {/* SKU */}

                {variant.sku && (
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <Hash size={12} />

                    SKU: {variant.sku}
                  </p>
                )}

                {/* BOTTOM DETAILS */}

                <div className="mt-3 flex flex-wrap items-end justify-between gap-2">

                  <div>

                    <p className="text-xs text-slate-500">
                      Quantity:{" "}
                      <span className="font-semibold text-slate-700">
                        {quantity}
                      </span>
                    </p>

                    {/* MOBILE UNIT PRICE */}

                    <p className="mt-1 text-xs text-slate-500 sm:hidden">
                      {formatPrice(sellingPrice)} / item
                    </p>

                  </div>

                  {/* ITEM TOTAL */}

                  <div className="text-right">

                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Item Total
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-[#0755E9] sm:text-base">
                      {formatPrice(itemTotal)}
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        );
      })}

    </div>
  );
}
