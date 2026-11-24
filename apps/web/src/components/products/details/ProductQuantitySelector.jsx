
"use client";

import { Minus, Plus, PackageCheck } from "lucide-react";
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

    setQuantity((current) =>
      Math.max(1, (Number(current) || 1) - 1)
    );
  };

  const handleIncrease = () => {
    if (!canPurchase) {
      toast.error("Product is out of stock");
      return;
    }

    if (currentQuantity >= availableStock) {
      toast.warning(`Only ${availableStock} items available`);
      return;
    }

    setQuantity((current) =>
      Math.min(
        availableStock,
        (Number(current) || 1) + 1
      )
    );
  };

  return (
    <section className="mt-7" aria-label="Product quantity">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[#101828]">
          Quantity
        </label>

        {canPurchase && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <PackageCheck size={14} />
            {availableStock} available
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`inline-flex h-12 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition ${
            !canPurchase ? "opacity-50" : ""
          }`}
        >
          <button
            type="button"
            onClick={handleDecrease}
            disabled={!canPurchase || currentQuantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-[#0755e9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={17} />
          </button>

          <span
            aria-live="polite"
            aria-atomic="true"
            className="flex h-full min-w-14 items-center justify-center border-x border-slate-200 px-3 text-base font-bold tabular-nums text-[#101828]"
          >
            {currentQuantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={!canPurchase || currentQuantity >= availableStock}
            aria-label="Increase quantity"
            className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-[#0755e9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={17} />
          </button>
        </div>

        {!canPurchase && (
          <span className="text-xs font-semibold text-red-500">
            Currently unavailable
          </span>
        )}
      </div>

      {canPurchase && availableStock <= 5 && (
        <p className="mt-2 text-xs font-medium text-orange-600">
          Only {availableStock} left in stock
        </p>
      )}
    </section>
  );
}
