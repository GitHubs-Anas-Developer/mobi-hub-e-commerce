"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Button, Input, InputNumber, Switch, Tag, Tooltip } from "antd";
import { ImagePlus, Plus, Star, Trash2, X } from "lucide-react";

const ATTRIBUTE_PRESETS = ["Color", "Storage", "RAM", "Size", "Model", "Edition"];

const getImageSrc = (image) => {
  if (!image) return "";

  if (typeof File !== "undefined" && image instanceof File) {
    return URL.createObjectURL(image);
  }

  return image.url || "";
};

export default function ProductVariantCard({
  variant,
  index,
  totalVariants,
  onChange,
  onRemove,
  onAddAttribute,
  onAttributeChange,
  onRemoveAttribute,
  onQuickAddAttribute,
  onSetDefault,
  onImageChange,
  onRemoveImage,
  errors = {},
}) {
  const fileInputRef = useRef(null);

  const imageSources = useMemo(
    () => (variant.images || []).map((image) => getImageSrc(image)),
    [variant.images],
  );

  useEffect(() => {
    return () => {
      imageSources.forEach((src) => {
        if (src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
      });
    };
  }, [imageSources]);

  const handleFieldChange = (field, value) => {
    onChange(index, field, value);
  };

  // Live Pricing & Discount Calculation (real derived math from MRP vs Selling Price)
  const mrpNum = Number(variant.mrp);
  const sellingNum = Number(variant.sellingPrice);
  const hasValidPrices =
    Number.isFinite(mrpNum) &&
    Number.isFinite(sellingNum) &&
    mrpNum > 0 &&
    sellingNum > 0;
  const priceMismatch = hasValidPrices && sellingNum > mrpNum;
  const savings = hasValidPrices && !priceMismatch ? mrpNum - sellingNum : 0;
  const discountPct =
    hasValidPrices && !priceMismatch && mrpNum > 0
      ? Math.round((savings / mrpNum) * 100)
      : 0;

  // Live Stock Status Indicator
  const stockNum = Number(variant.stock ?? 0);
  const thresholdNum = Number(variant.lowStockThreshold ?? 5);
  const stockBadge =
    stockNum <= 0
      ? { color: "error", label: "Out of Stock" }
      : stockNum <= thresholdNum
        ? { color: "warning", label: "Low Stock" }
        : { color: "success", label: "In Stock" };

  const handlePresetAttribute = (presetKey) => {
    const exists = (variant.attributes || []).some(
      (attr) => attr.key.trim().toLowerCase() === presetKey.toLowerCase(),
    );
    if (exists) return;

    if (onQuickAddAttribute) {
      onQuickAddAttribute(index, presetKey);
      return;
    }

    const emptyIdx = (variant.attributes || []).findIndex(
      (attr) => !attr.key.trim() && !attr.value.trim(),
    );

    if (emptyIdx !== -1) {
      onAttributeChange(index, emptyIdx, "key", presetKey);
    } else {
      onAddAttribute(index);
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 transition sm:p-5 ${
        variant.isDefault
          ? "border-[#0755E9]/40 bg-[#EFF6FF]/20"
          : "border-[#E2E8F0] bg-white"
      }`}
    >
      {/* Variant Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0755E9] text-xs font-bold text-white">
            #{index + 1}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="!m-0 text-sm font-bold text-[#101828]">
                Variant {index + 1}
                {variant.sku ? ` • ${variant.sku.trim().toUpperCase()}` : ""}
              </h3>

              {variant.isDefault && (
                <Tag color="blue" className="!m-0 !font-semibold">
                  Default Variant
                </Tag>
              )}

              <Tag color={stockBadge.color} className="!m-0">
                {stockBadge.label}
              </Tag>

              {!variant.isActive && (
                <Tag color="default" className="!m-0">
                  Inactive
                </Tag>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!variant.isDefault && variant.isActive && (
            <Button
              size="small"
              icon={<Star size={13} className="text-amber-500" />}
              onClick={() => onSetDefault(index)}
            >
              Set Default
            </Button>
          )}

          <label className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
            <span>Active</span>
            <Switch
              size="small"
              checked={Boolean(variant.isActive)}
              onChange={(checked) => handleFieldChange("isActive", checked)}
            />
          </label>

          {totalVariants > 1 && (
            <Tooltip title="Remove variant">
              <Button
                size="small"
                danger
                icon={<Trash2 size={14} />}
                onClick={() => onRemove(index)}
                aria-label={`Remove variant ${index + 1}`}
              />
            </Tooltip>
          )}
        </div>
      </div>

      {/* Pricing & Inventory Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* SKU */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#475569]">
            Variant SKU *
          </label>
          <Input
            size="large"
            value={variant.sku}
            status={errors.sku ? "error" : undefined}
            onChange={(e) => handleFieldChange("sku", e.target.value)}
            placeholder="e.g. ELZ-PODS-WHT"
            className="font-mono uppercase"
          />
          {errors.sku && (
            <p className="mt-1 text-xs text-red-600">{errors.sku}</p>
          )}
        </div>

        {/* Regular Price / MRP */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#475569]">
            Regular Price (MRP ₹) *
          </label>
          <InputNumber
            size="large"
            min={0}
            step={1}
            className="!w-full"
            status={errors.mrp ? "error" : undefined}
            value={variant.mrp === "" ? null : Number(variant.mrp)}
            onChange={(val) =>
              handleFieldChange("mrp", val === null ? "" : val)
            }
            placeholder="2999"
          />
          {errors.mrp && (
            <p className="mt-1 text-xs text-red-600">{errors.mrp}</p>
          )}
        </div>

        {/* Sale Price / Selling Price */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-1">
            <label className="!mb-0 block text-xs font-semibold uppercase tracking-wide text-[#475569]">
              Sale Price (₹) *
            </label>
            {discountPct > 0 && (
              <Tag color="green" className="!m-0 !text-[10px] !font-bold">
                {discountPct}% OFF
              </Tag>
            )}
          </div>
          <InputNumber
            size="large"
            min={0}
            step={1}
            className="!w-full"
            status={errors.sellingPrice || priceMismatch ? "error" : undefined}
            value={
              variant.sellingPrice === "" ? null : Number(variant.sellingPrice)
            }
            onChange={(val) =>
              handleFieldChange("sellingPrice", val === null ? "" : val)
            }
            placeholder="2499"
          />
          {errors.sellingPrice || priceMismatch ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.sellingPrice || "Sale price cannot exceed MRP."}
            </p>
          ) : savings > 0 ? (
            <p className="mt-1 text-[11px] font-medium text-emerald-700">
              Customer saves ₹{savings.toLocaleString("en-IN")}
            </p>
          ) : null}
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#475569]">
            Stock Quantity *
          </label>
          <InputNumber
            size="large"
            min={0}
            step={1}
            precision={0}
            className="!w-full"
            status={errors.stock ? "error" : undefined}
            value={
              variant.stock === "" || variant.stock === undefined
                ? null
                : Number(variant.stock)
            }
            onChange={(val) =>
              handleFieldChange("stock", val === null ? 0 : val)
            }
            placeholder="25"
          />
          {errors.stock && (
            <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
          )}
        </div>

        {/* Low Stock Threshold */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#475569]">
            Low Stock Alert
          </label>
          <InputNumber
            size="large"
            min={0}
            step={1}
            precision={0}
            className="!w-full"
            status={errors.lowStockThreshold ? "error" : undefined}
            value={
              variant.lowStockThreshold === "" ||
              variant.lowStockThreshold === undefined
                ? null
                : Number(variant.lowStockThreshold)
            }
            onChange={(val) =>
              handleFieldChange("lowStockThreshold", val === null ? 0 : val)
            }
            placeholder="5"
          />
          {errors.lowStockThreshold && (
            <p className="mt-1 text-xs text-red-600">
              {errors.lowStockThreshold}
            </p>
          )}
        </div>
      </div>

      {/* Attributes (Color, Storage, Size, Model, etc.) */}
      <div className="mt-5 border-t border-[#E2E8F0] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="!m-0 text-xs font-bold uppercase tracking-wide text-[#101828]">
              Variant Attributes
            </h4>
            {ATTRIBUTE_PRESETS.map((preset) => {
              const exists = (variant.attributes || []).some(
                (a) => a.key.trim().toLowerCase() === preset.toLowerCase(),
              );
              return (
                <Tag
                  key={preset}
                  color={exists ? "blue" : "default"}
                  onClick={() => !exists && handlePresetAttribute(preset)}
                  className={`!m-0 text-[11px] select-none ${
                    exists
                      ? "opacity-60"
                      : "cursor-pointer hover:!border-[#0755E9] hover:!text-[#0755E9]"
                  }`}
                >
                  {exists ? preset : `+ ${preset}`}
                </Tag>
              );
            })}
          </div>

          <Button
            size="small"
            icon={<Plus size={13} />}
            onClick={() => onAddAttribute(index)}
          >
            Add Attribute
          </Button>
        </div>

        {(variant.attributes || []).length > 0 && (
          <div className="mt-3 space-y-2.5">
            {variant.attributes.map((attribute, attributeIndex) => {
              const incomplete =
                (attribute.key.trim() && !attribute.value.trim()) ||
                (!attribute.key.trim() && attribute.value.trim());

              return (
                <div
                  key={attributeIndex}
                  className="grid grid-cols-1 items-center gap-2.5 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    value={attribute.key}
                    status={incomplete && !attribute.key.trim() ? "error" : undefined}
                    onChange={(e) =>
                      onAttributeChange(
                        index,
                        attributeIndex,
                        "key",
                        e.target.value,
                      )
                    }
                    placeholder="Attribute (e.g. Color, Storage, Size, Model)"
                  />

                  <Input
                    value={attribute.value}
                    status={
                      incomplete && !attribute.value.trim() ? "error" : undefined
                    }
                    onChange={(e) =>
                      onAttributeChange(
                        index,
                        attributeIndex,
                        "value",
                        e.target.value,
                      )
                    }
                    placeholder="Value (e.g. Titanium Black, 256GB)"
                  />

                  <Tooltip title="Remove attribute">
                    <Button
                      danger
                      icon={<X size={14} />}
                      onClick={() => onRemoveAttribute(index, attributeIndex)}
                      aria-label={`Remove attribute ${attributeIndex + 1}`}
                    />
                  </Tooltip>
                </div>
              );
            })}
          </div>
        )}

        {errors.attributes && (
          <p className="mt-1.5 text-xs font-medium text-red-600">
            {errors.attributes}
          </p>
        )}
      </div>

      {/* Variant Images */}
      <div className="mt-5 border-t border-[#E2E8F0] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="!m-0 text-xs font-bold uppercase tracking-wide text-[#101828]">
              Variant Photos ({variant.images?.length || 0}/6)
            </h4>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Optional color/edition specific images (JPG, PNG, WEBP up to 5MB).
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => onImageChange(index, e)}
            className="hidden"
          />

          {(variant.images?.length || 0) < 6 && (
            <Button
              size="small"
              icon={<ImagePlus size={13} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Add Variant Photos
            </Button>
          )}
        </div>

        {(variant.images?.length || 0) > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {variant.images.map((image, imageIndex) => (
              <div
                key={image.publicId || `${image.name}-${imageIndex}`}
                className="relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
              >
                <div className="relative aspect-square">
                  <Image
                    src={imageSources[imageIndex]}
                    alt={`Variant ${index + 1} image ${imageIndex + 1}`}
                    fill
                    unoptimized
                    className="object-contain p-1.5"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveImage(index, imageIndex)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                  title="Remove variant image"
                  aria-label="Remove variant image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
