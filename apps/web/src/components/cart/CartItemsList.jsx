
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CartItemCard from "./CartItemCard";

export default function CartItemsList({
  items,
  isMutating,
  onQuantityChange,
  onRemove,
  onClear,
}) {
  const totalItems = items.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-bold text-[#101828]">
            Your Products
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {totalItems} items selected
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={isMutating}
          className="text-xs font-semibold text-slate-500 transition hover:text-red-600 disabled:opacity-40"
        >
          Clear Cart
        </button>
      </div>

      <div className="px-4 sm:px-6">
        {items.map((item) => (
          <CartItemCard
            key={item._id}
            item={item}
            isMutating={isMutating}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0755e9] hover:underline"
        >
          <ArrowLeft size={14} />
          Add more products
        </Link>
      </div>
    </section>
  );
}
