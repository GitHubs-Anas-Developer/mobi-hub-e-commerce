
import { Minus, Plus } from "lucide-react";

export default function ProductQuantitySelector({
  quantity,
  setQuantity,
  stock,
  canPurchase,
}) {
  return (
    <div className="mt-6">
      <label className="mb-2 block text-sm font-bold text-[#0F172A]">
        Quantity
      </label>

      <div className="flex w-fit items-center overflow-hidden rounded-lg border border-[#E2E8F0]">
        <button
          type="button"
          disabled={quantity <= 1}
          onClick={() =>
            setQuantity((current) => Math.max(1, current - 1))
          }
          aria-label="Decrease quantity"
          className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        >
          <Minus size={17} />
        </button>

        <span className="min-w-12 text-center text-sm font-bold">
          {quantity}
        </span>

        <button
          type="button"
          disabled={!canPurchase || quantity >= stock}
          onClick={() =>
            setQuantity((current) => Math.min(stock, current + 1))
          }
          aria-label="Increase quantity"
          className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        >
          <Plus size={17} />
        </button>
      </div>
    </div>
  );
}
