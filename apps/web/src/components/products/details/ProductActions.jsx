"use client";

import { useState } from "react";
import { ShoppingBag, Zap, Heart, LoaderCircle } from "lucide-react";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

export default function ProductActions({
  sellingPrice = 0,
  mrp = 0,
  onAddToCart,
  onBuyNow,
  onWishlist,
  isInWishlist = false,
  cartIsMutating = false,
  wishlistIsMutating = false,
  canPurchase = false,
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = async () => {
    const added = await onAddToCart?.();
    if (added) {
      setIsCartOpen(true);
    }
  };

  return (
    <>
      {/* Inline Desktop & Mobile Action Controls */}
      <section className="mt-6" aria-label="Purchase actions">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!canPurchase || cartIsMutating}
            onClick={handleAddToCart}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#0645C4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {cartIsMutating ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <ShoppingBag size={17} strokeWidth={2} />
            )}
            <span>
              {!canPurchase
                ? "Out of Stock"
                : cartIsMutating
                  ? "Adding..."
                  : "Add to Cart"}
            </span>
          </button>

          <button
            type="button"
            disabled={!canPurchase || cartIsMutating}
            onClick={onBuyNow}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#0755E9] bg-[#EFF6FF] px-5 py-3 text-sm font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-[#E2E8F0] disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Zap size={17} />
            <span>Buy Now</span>
          </button>

          <button
            type="button"
            disabled={wishlistIsMutating}
            onClick={onWishlist}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isInWishlist}
            className={`inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-sm ${
              isInWishlist
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-[#E2E8F0] bg-white text-[#101828] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
            }`}
          >
            {wishlistIsMutating ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Heart
                size={17}
                fill={isInWishlist ? "currentColor" : "none"}
              />
            )}
            <span>{isInWishlist ? "Wishlisted" : "Wishlist"}</span>
          </button>
        </div>

        {!canPurchase && (
          <p className="mt-2.5 text-xs font-semibold text-red-600">
            This product variant is currently out of stock. Try selecting another option above.
          </p>
        )}
      </section>

      {/* Sticky Bottom Mobile Purchase Bar (Mobile BottomNav is hidden on product details routes) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-6px_20px_rgba(16,24,40,0.08)] backdrop-blur-md sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="truncate text-lg font-extrabold text-[#101828] tabular-nums">
                {formatPrice(sellingPrice)}
              </span>
              {Number(mrp) > Number(sellingPrice) && (
                <span className="text-[11px] font-medium text-slate-400 line-through tabular-nums">
                  {formatPrice(mrp)}
                </span>
              )}
            </div>
            <p
              className={`text-[10px] font-semibold ${
                canPurchase ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {canPurchase ? "In stock" : "Out of stock"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={!canPurchase || cartIsMutating}
              onClick={handleAddToCart}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {cartIsMutating ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <ShoppingBag size={15} />
              )}
              <span>{cartIsMutating ? "Adding..." : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              disabled={!canPurchase || cartIsMutating}
              onClick={onBuyNow}
              className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-[#0755E9] bg-[#EFF6FF] px-3.5 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:border-[#E2E8F0] disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Zap size={14} />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>

      <MiniCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
