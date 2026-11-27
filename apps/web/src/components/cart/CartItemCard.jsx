"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, LoaderCircle, AlertTriangle } from "lucide-react";

import CartQuantityControl from "./CartQuantityControl";
import {
  formatPrice,
  getProduct,
  getItemPrice,
  getItemMrp,
  getItemDiscountPercent,
  getItemStock,
  getProductImage,
  getVariantLabel,
} from "./cart.utils";

export default function CartItemCard({
  item,
  isMutating = false,
  isItemBusy = false,
  onQuantityChange,
  onRemove,
}) {
  const product = getProduct(item);
  const quantity = Math.max(1, Number(item?.quantity || 1));
  const unitPrice = getItemPrice(item);
  const unitMrp = getItemMrp(item);
  const discountPercent = getItemDiscountPercent(item);
  const stock = getItemStock(item);
  const image = getProductImage(product);
  const variantLabel = getVariantLabel(item);
  const productName = product?.name || "Product";

  const productUrl = product?.slug
    ? `/products/${product.slug}`
    : "/products";

  const isOutOfStock = stock <= 0;
  const hasInsufficientStock = stock > 0 && quantity > stock;
  const isLowStock = stock > 0 && stock <= 5 && quantity <= stock;

  const lineTotal = unitPrice * quantity;
  const lineMrpTotal = unitMrp * quantity;
  const lineSavings = Math.max(0, lineMrpTotal - lineTotal);

  return (
    <article
      aria-busy={isItemBusy}
      className={`group flex flex-col gap-4 border-b border-[#E2E8F0] py-4 transition-opacity last:border-b-0 sm:flex-row sm:gap-5 sm:py-5 ${
        isItemBusy ? "opacity-65" : "opacity-100"
      }`}
    >
      {/* Product Image + Mobile Quick Header */}
      <div className="flex gap-3.5 sm:contents">
        <Link
          href={productUrl}
          aria-label={`View ${productName}`}
          className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 sm:h-28 sm:w-28"
        >
          {image ? (
            <img
              src={image}
              alt={productName}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ShoppingBag
              size={28}
              strokeWidth={1.4}
              className="text-slate-300"
              aria-hidden="true"
            />
          )}

          {discountPercent > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-md border border-red-100 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              -{discountPercent}%
            </span>
          )}
        </Link>

        {/* Mobile Title + Remove */}
        <div className="flex min-w-0 flex-1 flex-col justify-between sm:hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {product?.brand && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  {product.brand}
                </p>
              )}

              <Link
                href={productUrl}
                className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-[#101828] hover:text-[#0755E9]"
              >
                {productName}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => onRemove?.(item._id)}
              disabled={isMutating}
              aria-label={`Remove ${productName} from cart`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isItemBusy ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold text-[#101828] tabular-nums">
              {formatPrice(unitPrice)}
            </span>
            {unitMrp > unitPrice && (
              <span className="text-xs font-medium text-slate-400 line-through tabular-nums">
                {formatPrice(unitMrp)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Details + Controls */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* Desktop Title + Unit Price + Remove */}
        <div className="hidden items-start justify-between gap-4 sm:flex">
          <div className="min-w-0">
            {product?.brand && (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {product.brand}
              </p>
            )}

            <Link
              href={productUrl}
              className="line-clamp-2 text-base font-bold leading-snug text-[#101828] transition-colors hover:text-[#0755E9]"
            >
              {productName}
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {variantLabel && (
                <span className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
                  {variantLabel}
                </span>
              )}

              <span className="text-xs font-semibold text-[#64748B] tabular-nums">
                Unit: <span className="text-[#101828]">{formatPrice(unitPrice)}</span>
                {unitMrp > unitPrice && (
                  <span className="ml-1.5 font-normal text-slate-400 line-through">
                    {formatPrice(unitMrp)}
                  </span>
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemove?.(item._id)}
            disabled={isMutating}
            aria-label={`Remove ${productName} from cart`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isItemBusy ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            <span>Remove</span>
          </button>
        </div>

        {/* Variant + Availability Row */}
        <div className="mt-1 flex flex-wrap items-center gap-2 sm:mt-2.5">
          {variantLabel && (
            <span className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-semibold text-[#64748B] sm:hidden">
              {variantLabel}
            </span>
          )}

          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
              <AlertTriangle size={12} aria-hidden="true" />
              Out of Stock — remove to proceed
            </span>
          ) : hasInsufficientStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
              <AlertTriangle size={12} aria-hidden="true" />
              Only {stock} available — decrease quantity
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {isLowStock ? `In Stock · Only ${stock} left` : "In Stock"}
            </span>
          )}
        </div>

        {/* Bottom Bar: Quantity Control + Item Subtotal */}
        <div className="mt-3.5 flex items-end justify-between gap-3 pt-1 sm:mt-4">
          <CartQuantityControl
            quantity={quantity}
            stock={stock}
            disabled={isMutating || isOutOfStock}
            isUpdating={isItemBusy}
            onDecrease={() => onQuantityChange?.(item, quantity - 1)}
            onIncrease={() => onQuantityChange?.(item, quantity + 1)}
          />

          <div className="text-right">
            <p className="text-[11px] font-medium text-[#64748B]">
              Item Subtotal
            </p>
            <p className="mt-0.5 text-base font-extrabold tracking-tight text-[#101828] tabular-nums sm:text-lg">
              {formatPrice(lineTotal)}
            </p>
            {lineSavings > 0 && (
              <p className="text-[11px] font-semibold text-emerald-600 tabular-nums">
                Saved {formatPrice(lineSavings)}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
