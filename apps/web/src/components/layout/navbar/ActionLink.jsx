
import Link from "next/link";
import CountBadge from "./CountBadge";

export default function ActionLink({
  href,
  label,
  count = 0,
  children,
}) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-600 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
    >
      <span className="transition-transform duration-200 group-hover:scale-110">
        {children}
      </span>

      <CountBadge count={count} />
    </Link>
  );
}
