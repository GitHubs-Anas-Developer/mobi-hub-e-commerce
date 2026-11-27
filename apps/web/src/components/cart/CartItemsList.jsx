"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import CartItemCard from "./CartItemCard";

function getSafeQuantity(quantity) {
  const value = Number(quantity);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export default function CartItemsList({
  items = [],
  isMutating = false,
  activeItemId = "",
  onQuantityChange,
  onRemove,
  onClear,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  const cartItems = Array.isArray(items)
    ? items.filter((item) => item?._id)
    : [];

  const totalItems = cartItems.reduce(
    (sum, item) => sum + getSafeQuantity(item?.quantity),
    0
  );

  const handleConfirmClear = async () => {
    setConfirmClear(false);
    await onClear?.();
  };

  return (
    <section
      aria-labelledby="cart-products-heading"
      className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3.5 sm:px-6 sm:py-4">
        <div>
          <h2
            id="cart-products-heading"
            className="text-sm font-bold tracking-tight text-[#101828] sm:text-base"
          >
            Your Selected Products
          </h2>
          <p aria-live="polite" className="mt-0.5 text-xs text-[#64748B] tabular-nums">
            {cartItems.length} {cartItems.length === 1 ? "product" : "products"} ·{" "}
            {totalItems} {totalItems === 1 ? "unit" : "units"}
          </p>
        </div>

        {cartItems.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isMutating}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                disabled={isMutating}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={isMutating}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} />
              <span>Clear Cart</span>
            </button>
          )
        )}
      </div>

      {/* Product Rows */}
      <div className="px-4 sm:px-6">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartItemCard
              key={item._id}
              item={item}
              isMutating={isMutating}
              isItemBusy={String(activeItemId) === String(item._id)}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
              <ShoppingCart size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#101828]">
              Your cart is empty
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Add gadgets and accessories to continue shopping.
            </p>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0755E9] transition hover:text-[#082B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:text-[13px]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Add More Products</span>
        </Link>

        <span className="hidden text-xs text-[#64748B] sm:inline">
          Saved automatically to your ELENZO account
        </span>
      </div>
    </section>
  );
}
