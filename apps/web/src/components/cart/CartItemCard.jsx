
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import CartQuantityControl from "./CartQuantityControl";
import {
  formatPrice,
  getProduct,
  getItemPrice,
  getItemStock,
  getProductImage,
  getVariantLabel,
} from "./cart.utils";

export default function CartItemCard({
  item,
  isMutating,
  onQuantityChange,
  onRemove,
}) {
  const product = getProduct(item);
  const quantity = Number(item?.quantity || 1);
  const price = getItemPrice(item);
  const stock = getItemStock(item);
  const image = getProductImage(product);
  const variantLabel = getVariantLabel(item);
  const productName = product?.name || "Product";

  const productUrl = product?.slug
    ? `/products/${product.slug}`
    : "/products";

  return (
    <article className="group flex gap-4 border-b border-slate-100 py-5 last:border-0 sm:gap-5">
      <Link
        href={productUrl}
        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-[#F8FAFC] sm:h-32 sm:w-32"
      >
        {image ? (
          <img
            src={image}
            alt={productName}
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ShoppingBag size={28} className="text-slate-300" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product?.brand && (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {product.brand}
              </p>
            )}

            <Link
              href={productUrl}
              className="line-clamp-2 text-sm font-semibold leading-5 text-[#101828] hover:text-[#0755e9] sm:text-base"
            >
              {productName}
            </Link>

            {variantLabel && (
              <p className="mt-1.5 text-xs text-slate-500">
                {variantLabel}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  stock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-[11px] font-medium ${
                  stock > 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {stock > 0 ? "In stock" : "Out of stock"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item._id)}
            disabled={isMutating}
            aria-label={`Remove ${productName}`}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 size={17} />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <CartQuantityControl
            quantity={quantity}
            stock={stock}
            disabled={isMutating || stock <= 0}
            onDecrease={() => onQuantityChange(item, quantity - 1)}
            onIncrease={() => onQuantityChange(item, quantity + 1)}
          />

          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Item Total
            </p>
            <p className="mt-0.5 text-base font-bold text-[#101828] sm:text-lg">
              {formatPrice(price * quantity)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
