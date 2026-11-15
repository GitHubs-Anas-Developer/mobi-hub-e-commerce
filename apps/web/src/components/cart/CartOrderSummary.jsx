
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { formatPrice } from "./cart.utils";

export default function CartOrderSummary({
  subtotal,
  totalItems,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[#101828]">
        Order Summary
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Review your order details
      </p>

      <div className="mt-6 space-y-4 border-b border-slate-100 pb-5">
        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-500">
            Subtotal ({totalItems} items)
          </span>
          <span className="font-semibold text-slate-800">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-500">Shipping</span>
          <span className="text-xs font-semibold text-slate-500">
            Calculated at checkout
          </span>
        </div>

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-500">Discount</span>
          <span className="font-medium text-slate-500">—</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 py-5">
        <span className="text-sm font-bold text-[#101828]">
          Estimated Total
        </span>
        <span className="text-xl font-extrabold tracking-tight text-[#101828]">
          {formatPrice(subtotal)}
        </span>
      </div>

      <Link
        href="/checkout"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0645c4] active:scale-[0.99]"
      >
        Proceed to Checkout
        <ArrowRight size={17} />
      </Link>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
        <LockKeyhole size={13} />
        Secure checkout
      </div>
    </section>
  );
}
