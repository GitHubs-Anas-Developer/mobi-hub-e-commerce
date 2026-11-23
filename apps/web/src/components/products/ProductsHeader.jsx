
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

export default function ProductsHeader({
  total = 0,
  breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop" },
  ],
}) {
  return (
    <header className="mb-5 w-full">
      {/* BREADCRUMB */}

      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  size={13}
                  className="text-slate-400"
                />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "font-medium text-slate-800"
                      : ""
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* PAGE TITLE */}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Shop All Products
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Discover the latest mobile accessories at Mobi Hub.
          </p>
        </div>

        {/* PRODUCT COUNT */}

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2">
          <Package
            size={15}
            className="text-blue-600"
          />

          <span className="text-xs font-semibold text-blue-700">
            {total.toLocaleString("en-IN")} Products
          </span>
        </div>
      </div>
    </header>
  );
}
