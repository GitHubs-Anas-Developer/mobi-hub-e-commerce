
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items = [], className = "" }) => {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`w-full ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-[#0755e9]"
          >
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              <ChevronRight
                size={13}
                className="shrink-0 text-slate-400"
              />

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-[#0755e9]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="font-medium text-[#101828]"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
