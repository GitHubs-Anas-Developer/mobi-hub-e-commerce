
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
];

export default function NavLinks() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <nav className="hidden h-12 items-center gap-8 xl:flex">
      {NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative flex h-full items-center text-sm font-semibold transition ${
            isActive(item.href)
              ? "text-blue-700"
              : "text-slate-600 hover:text-blue-700"
          }`}
        >
          {item.label}

          {isActive(item.href) && (
            <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-blue-700" />
          )}
        </Link>
      ))}

      <span className="ml-auto text-xs font-medium text-slate-500">
        Your trusted tech accessories store
      </span>
    </nav>
  );
}
