import { Grid2X2, List } from "lucide-react";

export default function ProductViewToggle({
  viewMode = "grid",
  setViewMode,
}) {
  const buttonClass = (active) =>
    `flex h-8 w-8 items-center justify-center rounded-lg transition ${
      active
        ? "bg-blue-50 text-blue-600"
        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
    }`;

  return (
    <div className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
      <button
        type="button"
        onClick={() => setViewMode("grid")}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
        className={buttonClass(viewMode === "grid")}
      >
        <Grid2X2 size={17} />
      </button>

      <button
        type="button"
        onClick={() => setViewMode("list")}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
        className={buttonClass(viewMode === "list")}
      >
        <List size={18} />
      </button>
    </div>
  );
}