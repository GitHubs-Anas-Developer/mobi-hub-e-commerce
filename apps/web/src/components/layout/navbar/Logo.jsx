import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Mobi Hub Home"
      className="group inline-flex w-fit min-w-0 shrink-0 items-center gap-2 sm:gap-2.5"
    >
      {/* Logo Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-700 sm:h-11 sm:w-11">
        <Smartphone
          size={21}
          strokeWidth={2}
          className="sm:hidden"
        />
        <Smartphone
          size={25}
          strokeWidth={2}
          className="hidden sm:block"
        />
      </div>

      {/* Brand Name */}
      <div className="flex min-w-0 flex-col justify-center leading-none">
        <span className="whitespace-nowrap text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl lg:text-[28px]">
          Mobi<span className="text-blue-600">Hub</span>
    
        </span>

        <span className="mt-1 whitespace-nowrap text-[9px] font-medium tracking-wide text-slate-500 sm:text-[11px]">
          Mobile Accessories Store
        </span>
      </div>
    </Link>
  );
}