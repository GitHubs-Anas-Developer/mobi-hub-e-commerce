
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ChevronRight } from "lucide-react";

export default function CartHeader({ totalItems = 0 }) {
  return (
    <header className="mb-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400"
      >
        <Link href="/" className="transition hover:text-[#0755e9]">
          Home
        </Link>

        <ChevronRight size={13} />

        <span className="text-slate-700">
          Shopping Cart
        </span>
      </nav>

      {/* Header Content */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          {/* Cart Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755e9]">
            <ShoppingBag size={23} strokeWidth={1.8} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
                Shopping Cart
              </h1>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Review your selected products before checkout.
            </p>
          </div>
        </div>

        {/* Continue Shopping */}
        <Link
          href="/products"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#0755e9] hover:bg-blue-50 hover:text-[#0755e9]"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>
      </div>
    </header>
  );
}
