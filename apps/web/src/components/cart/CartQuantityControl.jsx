"use client";

import { Minus, Plus, LoaderCircle } from "lucide-react";

export default function CartQuantityControl({
  quantity = 1,
  stock = 99,
  disabled = false,
  isUpdating = false,
  onDecrease,
  onIncrease,
}) {
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const safeStock = Math.max(0, Number(stock) || 0);
  const canDecrease = !disabled && !isUpdating && safeQuantity > 1;
  const canIncrease = !disabled && !isUpdating && safeQuantity < safeStock;

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div
        role="group"
        aria-label="Quantity selector"
        className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] sm:h-10"
      >
        <button
          type="button"
          onClick={onDecrease}
          disabled={!canDecrease}
          aria-label="Decrease quantity"
          title={safeQuantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
          className="flex h-full w-9 items-center justify-center text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9] active:bg-blue-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent sm:w-10"
        >
          <Minus size={14} strokeWidth={2.2} />
        </button>

        <span
          aria-live="polite"
          className="flex h-full min-w-9 items-center justify-center border-x border-[#E2E8F0] bg-white px-2 text-xs font-bold text-[#101828] tabular-nums sm:min-w-10 sm:text-sm"
        >
          {isUpdating ? (
            <LoaderCircle
              size={14}
              className="animate-spin text-[#0755E9]"
              aria-label="Updating quantity"
            />
          ) : (
            safeQuantity
          )}
        </span>

        <button
          type="button"
          onClick={onIncrease}
          disabled={!canIncrease}
          aria-label="Increase quantity"
          title={
            safeQuantity >= safeStock
              ? "Maximum available stock reached"
              : "Increase quantity"
          }
          className="flex h-full w-9 items-center justify-center text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9] active:bg-blue-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent sm:w-10"
        >
          <Plus size={14} strokeWidth={2.2} />
        </button>
      </div>

      {safeStock > 0 && safeQuantity >= safeStock && (
        <span className="text-[10px] font-medium text-[#64748B]">
          Max stock ({safeStock})
        </span>
      )}
    </div>
  );
}
