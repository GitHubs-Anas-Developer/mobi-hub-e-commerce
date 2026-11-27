"use client";

import { LayoutGrid, List } from "lucide-react";

export default function ProductViewToggle({
  viewMode = "grid",
  setViewMode,
}) {
  const buttonClass = (active) =>
    `flex h-7 w-8 items-center justify-center rounded-lg transition-all duration-150 sm:h-8 sm:w-9 ${
      active
        ? "bg-[#0755E9] text-white shadow-xs"
        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#101828]"
    }`;

  return (
    <div
      className="flex h-9 shrink-0 items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1 sm:h-10"
      role="group"
      aria-label="Product display mode"
    >
      <button
        type="button"
        onClick={() => setViewMode?.("grid")}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
        className={buttonClass(viewMode === "grid")}
      >
        <LayoutGrid size={16} />
      </button>

      <button
        type="button"
        onClick={() => setViewMode?.("list")}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
        className={buttonClass(viewMode === "list")}
      >
        <List size={17} />
      </button>
    </div>
  );
}
