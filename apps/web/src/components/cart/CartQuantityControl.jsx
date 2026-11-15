
import { Minus, Plus } from "lucide-react";

export default function CartQuantityControl({
  quantity,
  stock,
  disabled,
  onDecrease,
  onIncrease,
}) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
        className="flex h-full w-9 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        <Minus size={14} />
      </button>

      <span className="w-8 text-center text-sm font-semibold text-slate-900">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || quantity >= stock}
        aria-label="Increase quantity"
        className="flex h-full w-9 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
