"use client";

import { Button, Card, Empty, Input, Tag, Tooltip } from "antd";
import { ListChecks, Plus, Trash2 } from "lucide-react";

const QUICK_SPEC_KEYS = [
  "Display",
  "Processor",
  "Battery",
  "Connectivity",
  "Charging",
  "Warranty",
  "Weight",
  "In the Box",
];

export default function ProductSpecifications({
  specifications = [],
  onAdd,
  onChange,
  onRemove,
  onQuickAdd,
  error = "",
}) {
  const handleQuickPreset = (presetKey) => {
    const exists = specifications.some(
      (item) => item.key.trim().toLowerCase() === presetKey.toLowerCase(),
    );
    if (exists) return;

    if (onQuickAdd) {
      onQuickAdd(presetKey);
      return;
    }

    const emptyIndex = specifications.findIndex(
      (item) => !item.key.trim() && !item.value.trim(),
    );

    if (emptyIndex !== -1) {
      onChange(emptyIndex, "key", presetKey);
    } else {
      onAdd();
    }
  };

  return (
    <Card
      className="!border-[#E2E8F0] shadow-xs"
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <ListChecks size={17} />
            </div>
            <div>
              <h2 className="!m-0 text-base font-bold text-[#101828]">
                Product Specifications
              </h2>
              <p className="mt-0.5 text-xs font-normal text-[#64748B]">
                Add structured technical specs displayed on the product details page.
              </p>
            </div>
          </div>

          <Button type="primary" ghost icon={<Plus size={15} />} onClick={onAdd}>
            Add Row
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Quick Electronics Spec Presets */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
          <span className="text-xs font-semibold text-[#64748B]">
            Quick add:
          </span>
          {QUICK_SPEC_KEYS.map((preset) => {
            const alreadyAdded = specifications.some(
              (item) => item.key.trim().toLowerCase() === preset.toLowerCase(),
            );

            return (
              <Tag
                key={preset}
                color={alreadyAdded ? "blue" : "default"}
                onClick={() => !alreadyAdded && handleQuickPreset(preset)}
                className={`!m-0 select-none ${
                  alreadyAdded
                    ? "opacity-60"
                    : "cursor-pointer hover:!border-[#0755E9] hover:!text-[#0755E9]"
                }`}
              >
                {alreadyAdded ? preset : `+ ${preset}`}
              </Tag>
            );
          })}
        </div>

        {/* Specification Rows */}
        {specifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No specifications added yet."
          />
        ) : (
          <div className="space-y-3">
            {specifications.map((specification, index) => {
              const hasKeyOnly =
                Boolean(specification.key.trim()) &&
                !specification.value.trim();
              const hasValueOnly =
                !specification.key.trim() &&
                Boolean(specification.value.trim());

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Specification Name
                    </label>
                    <Input
                      value={specification.key}
                      status={hasValueOnly ? "error" : undefined}
                      onChange={(event) =>
                        onChange(index, "key", event.target.value)
                      }
                      placeholder="e.g. Connectivity"
                    />
                    {hasValueOnly && (
                      <p className="mt-1 text-xs text-red-600">
                        Enter a specification name or remove this row.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Specification Value
                    </label>
                    <Input
                      value={specification.value}
                      status={hasKeyOnly ? "error" : undefined}
                      onChange={(event) =>
                        onChange(index, "value", event.target.value)
                      }
                      placeholder="e.g. Bluetooth 5.3 + USB-C"
                    />
                    {hasKeyOnly && (
                      <p className="mt-1 text-xs text-red-600">
                        Enter a value or remove this row.
                      </p>
                    )}
                  </div>

                  <div className="flex sm:pt-6">
                    <Tooltip
                      title={
                        specifications.length === 1
                          ? "Keep at least one specification row (leave empty if unused)"
                          : "Remove specification"
                      }
                    >
                      <Button
                        danger
                        icon={<Trash2 size={15} />}
                        disabled={specifications.length === 1}
                        onClick={() => onRemove(index)}
                        aria-label={`Remove specification ${index + 1}`}
                      />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    </Card>
  );
}
