
import { Heart, ShoppingCart } from "lucide-react";

export default function ProductActions({
  onAddToCart,
  onWishlist,
  isInWishlist,
  cartIsMutating,
  wishlistIsMutating,
  canPurchase,
  actionMessage,
  actionMessageType,
}) {
  return (
    <>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!canPurchase || cartIsMutating}
          onClick={onAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShoppingCart size={19} />
          {cartIsMutating ? "Adding..." : "Add to Cart"}
        </button>

        <button
          type="button"
          aria-label={
            isInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          disabled={wishlistIsMutating}
          onClick={onWishlist}
          className={`flex items-center justify-center rounded-lg border px-5 py-4 transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isInWishlist
              ? "border-red-300 bg-red-50 text-red-600"
              : "border-[#E2E8F0] text-[#0F172A] hover:border-red-300 hover:text-red-600"
          }`}
        >
          <Heart
            size={20}
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>
      </div>

      {actionMessage && (
        <div
          role="status"
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            actionMessageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {actionMessage}
        </div>
      )}
    </>
  );
}
