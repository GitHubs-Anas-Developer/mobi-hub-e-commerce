
"use client";

import { useState } from "react";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";
import {
  Heart,
  ShoppingCart,
  Zap,
  Loader2,
} from "lucide-react";

export default function ProductActions({
  onAddToCart,
  onBuyNow,
  onWishlist,
  isInWishlist,
  cartIsMutating,
  wishlistIsMutating,
  canPurchase,
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = async () => {
    try {
      await onAddToCart();
      setIsCartOpen(true);
    } catch (error) {
      // Keep the drawer closed if adding to cart fails.
    }
  };

  return (
    <>
      <section className="
        sticky bottom-0 z-40
        -mx-4 mt-7 border-t border-slate-200
        bg-white/95 px-4 py-3 backdrop-blur-lg
        sm:static sm:mx-0 sm:border-0
        sm:bg-transparent sm:p-0 sm:backdrop-blur-none
      ">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2.5 sm:gap-3">

          {/* Add To Cart */}
          <button
            type="button"
            disabled={!canPurchase || cartIsMutating}
            onClick={handleAddToCart}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-3 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0645c4] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {cartIsMutating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShoppingCart size={18} />
            )}
            <span className="truncate">
              {cartIsMutating ? "Adding..." : "Add to Cart"}
            </span>
          </button>

          {/* Buy Now */}
          <button
            type="button"
            disabled={!canPurchase || cartIsMutating}
            onClick={onBuyNow}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#0755e9] bg-white px-3 py-3 text-sm font-bold text-[#0755e9] transition hover:bg-blue-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            <Zap size={17} />
            <span className="truncate">Buy Now</span>
          </button>

          {/* Wishlist */}
          <button
            type="button"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isInWishlist}
            disabled={wishlistIsMutating}
            onClick={onWishlist}
            className={`flex min-h-12 min-w-12 items-center justify-center rounded-xl border transition active:scale-95 disabled:opacity-50 ${
              isInWishlist
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            {wishlistIsMutating ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Heart
                size={20}
                fill={isInWishlist ? "currentColor" : "none"}
              />
            )}
          </button>
        </div>

        {!canPurchase && (
          <p className="mt-3 text-sm font-medium text-red-500">
            This product is currently unavailable.
          </p>
        )}
      </section>

      <MiniCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
