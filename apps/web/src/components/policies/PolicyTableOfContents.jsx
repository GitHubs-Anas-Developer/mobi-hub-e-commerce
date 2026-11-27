"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ListOrdered } from "lucide-react";

export default function PolicyTableOfContents({ sections = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile & Tablet Collapsible Table of Contents */}
      <div className="mb-5 rounded-2xl border border-[#E2E8F0] bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-extrabold text-[#101828]">
            <ListOrdered
              size={16}
              className="text-[#0755E9]"
              aria-hidden="true"
            />
            <span>Table of Contents ({sections.length})</span>
          </span>

          {mobileOpen ? (
            <ChevronUp size={16} className="text-[#64748B]" />
          ) : (
            <ChevronDown size={16} className="text-[#64748B]" />
          )}
        </button>

        {mobileOpen && (
          <nav
            aria-label="Policy table of contents mobile"
            className="border-t border-[#E2E8F0] px-3 py-3"
          >
            <ol className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#64748B] transition hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                  >
                    <span className="font-mono text-[11px] font-bold text-[#0755E9]">
                      {section.number}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {/* Desktop Sticky Table of Contents */}
      <nav
        aria-label="Policy table of contents"
        className="hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs lg:block"
      >
        <div className="mb-3 flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <ListOrdered
            size={16}
            className="text-[#0755E9]"
            aria-hidden="true"
          />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#101828]">
            On This Page
          </h2>
        </div>

        <ol className="max-h-[60vh] space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="group flex items-start gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-[#64748B] transition hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              >
                <span className="mt-0.5 shrink-0 font-mono text-[10px] font-bold text-[#64748B] group-hover:text-[#0755E9]">
                  {section.number}
                </span>
                <span className="leading-snug">{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

