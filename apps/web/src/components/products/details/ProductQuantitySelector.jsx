"use client";

import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ProductQuantitySelector({
  quantity,
  setQuantity,
  stock,
  canPurchase,
}) {
  const availableStock = Math.max(0, Number(stock) || 0);
  const currentQuantity = Math.max(
    1,
    Math.min(Number(quantity) || 1, availableStock || 1)
  );

  const handleDecrease = () => {
    if (!canPurchase) return;

    if (currentQuantity <= 1) {
      toast.warning("Minimum quantity is 1");
      return;
    }

    setQuantity?.((current) => Math.max(1, (Number(current) || 1) - 1));
  };

  const handleIncrease = () => {
    if (!canPurchase) {
      toast.error("Product is currently out of stock");
      return;
    }

    if (currentQuantity >= availableStock) {
      toast.warning(`Only ${availableStock} items available`);
      return;
    }

    setQuantity?.((current) =>
      Math.min(availableStock, (Number(current) || 1) + 1)
    );
  };

  return (
    <section className="mt-5" aria-label="Product quantity">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Quantity
        </span>

        <div
          className={`inline-flex h-10 items-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition ${
            !canPurchase ? "opacity-50" : ""
          }`}
        >
          <button
            type="button"
            onClick={handleDecrease}
            disabled={!canPurchase || currentQuantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-full w-10 items-center justify-center text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <Minus size={15} strokeWidth={2.2} />
          </button>

          <span
            aria-live="polite"
            aria-atomic="true"
            className="flex h-full min-w-11 items-center justify-center border-x border-[#E2E8F0] bg-white px-3 text-sm font-bold text-[#101828] tabular-nums"
          >
            {currentQuantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={!canPurchase || currentQuantity >= availableStock}
            aria-label="Increase quantity"
            className="flex h-full w-10 items-center justify-center text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <Plus size={15} strokeWidth={2.2} />
          </button>
        </div>

        {canPurchase && currentQuantity >= availableStock && (
          <span className="text-xs font-medium text-[#64748B]">
            Max stock reached ({availableStock})
          </span>
        )}
      </div>
    </section>
  );
}
