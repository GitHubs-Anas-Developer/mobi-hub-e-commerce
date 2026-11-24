
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, Zap, Loader2 } from "lucide-react";

import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

export default function ProductActions({
  onAddToCart,
  onBuyNow,
  cartIsMutating = false,
  canPurchase = true,
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDisabled =
    !canPurchase || cartIsMutating || isBuyingNow;

  const handleAddToCart = async () => {
    if (isDisabled || !onAddToCart) return;

    try {
      const success = await onAddToCart();

      if (success) {
        setIsCartOpen(true);
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const handleBuyNow = async () => {
    if (isDisabled || !onBuyNow) return;

    try {
      setIsBuyingNow(true);
      await onBuyNow();
    } catch (error) {
      console.error("Buy now failed:", error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <>
      {/* FIXED BOTTOM ACTION BAR */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-[100]
          w-full
          border-t border-slate-200/90
          bg-white/95
          px-3 pt-3
          pb-[calc(12px+env(safe-area-inset-bottom))]
          shadow-[0_-4px_24px_rgba(15,23,42,0.08)]
          backdrop-blur-xl
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mx-auto flex w-full max-w-7xl
            justify-center
            lg:justify-end
          "
        >
          <div
            className="
              grid w-full max-w-[520px]
              grid-cols-2 gap-3
              sm:gap-4
            "
          >
            {/* ADD TO CART */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isDisabled}
              aria-busy={cartIsMutating}
              className="
                inline-flex min-h-[50px] w-full
                items-center justify-center gap-2
                rounded-xl
                border border-[#0755e9]
                bg-white
                px-3 py-3
                text-sm font-semibold text-[#0755e9]
                transition-all duration-200
                hover:bg-blue-50
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#0755e9]
                focus-visible:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:min-h-[54px]
                sm:text-base
              "
            >
              {cartIsMutating ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5 shrink-0" />
              )}

              <span>
                {cartIsMutating ? "Adding..." : "Add to Cart"}
              </span>
            </button>

            {/* BUY NOW */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isDisabled}
              aria-busy={isBuyingNow}
              className="
                inline-flex min-h-[50px] w-full
                items-center justify-center gap-2
                rounded-xl
                bg-[#0755e9]
                px-3 py-3
                text-sm font-semibold text-white
                shadow-sm
                transition-all duration-200
                hover:bg-[#0645c4]
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#0755e9]
                focus-visible:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:min-h-[54px]
                sm:text-base
              "
            >
              {isBuyingNow ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 shrink-0" />
              )}

              <span>
                {isBuyingNow ? "Processing..." : "Buy Now"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MINI CART DRAWER */}
      <MiniCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>,
    document.body
  );
}
