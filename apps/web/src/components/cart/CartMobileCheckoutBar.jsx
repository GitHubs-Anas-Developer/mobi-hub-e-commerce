
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "./cart.utils";

export default function CartMobileCheckoutBar({
  subtotal,
  totalItems,
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_24px_rgba(15,23,42,0.07)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Subtotal · {totalItems} items
          </p>

          <p className="mt-0.5 text-lg font-extrabold text-[#101828]">
            {formatPrice(subtotal)}
          </p>
        </div>

        <Link
          href="/checkout"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-4 py-3 text-sm font-bold text-white"
        >
          Checkout
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
