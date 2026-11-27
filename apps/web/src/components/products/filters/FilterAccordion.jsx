"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterAccordion({
  title,
  icon: Icon,
  defaultOpen = true,
  active = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[#E2E8F0] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors hover:bg-[#F8FAFC]"
      >
        <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-[#101828]">
          {Icon && (
            <Icon
              size={15}
              className="shrink-0 text-[#0755E9]"
              aria-hidden="true"
            />
          )}
          <span className="truncate">{title}</span>
          {active && (
            <span
              aria-label="Filter active"
              className="h-2 w-2 shrink-0 rounded-full bg-[#0755E9]"
            />
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#64748B] transition-transform duration-200 ${
            open ? "rotate-180 text-[#0755E9]" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}
