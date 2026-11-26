
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

export default function ProductsHeader({
  total = 0,
  title = "Shop All Products",
  description = "Discover the latest gadgets and electronics at ELEZIO.",
}) {
  return (
    <header className="mb-5 w-full">

      {/* PAGE TITLE & PRODUCT COUNT */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[#101828] sm:text-2xl">
            {title}
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {description}
          </p>
        </div>

        {/* PRODUCT COUNT */}
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2">
          <Package size={15} className="text-[#0755e9]" />

          <span className="text-xs font-semibold text-[#0755e9]">
            {total.toLocaleString("en-IN")}{" "}
            {total === 1 ? "Product" : "Products"}
          </span>
        </div>
      </div>
    </header>
  );
}
