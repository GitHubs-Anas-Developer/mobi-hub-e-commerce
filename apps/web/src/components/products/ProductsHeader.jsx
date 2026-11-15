
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function ProductsHeader({
  total = 0,
  breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop" },
  ],
}) {
  return (
    <header className="mb-5">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-slate-500"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 && <ChevronRight size={13} />}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-medium text-slate-800" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </header>
  );
}
