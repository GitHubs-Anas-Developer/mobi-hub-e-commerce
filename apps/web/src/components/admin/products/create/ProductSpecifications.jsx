
"use client";

import { Plus, Trash2 } from "lucide-react";

export default function ProductSpecifications({
  specifications,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Product Specifications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add technical details about your product.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Specification
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {specifications.map((specification, index) => (
          <div
            key={index}
            className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Specification Name
              </label>

              <input
                type="text"
                value={specification.key}
                onChange={(event) =>
                  onChange(index, "key", event.target.value)
                }
                placeholder="e.g. Connectivity"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Value
              </label>

              <input
                type="text"
                value={specification.value}
                onChange={(event) =>
                  onChange(index, "value", event.target.value)
                }
                placeholder="e.g. Bluetooth 5.3"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={specifications.length === 1}
              title="Remove specification"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}

        {specifications.length === 0 && (
          <p className="rounded-lg bg-slate-50 py-8 text-center text-sm text-slate-500">
            No specifications added yet.
          </p>
        )}
      </div>
    </section>
  );
}
