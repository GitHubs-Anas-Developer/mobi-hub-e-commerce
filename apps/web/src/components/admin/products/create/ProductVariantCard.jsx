
"use client";

import Image from "next/image";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Star,
} from "lucide-react";

export default function ProductVariantCard({
  variant,
  index,
  totalVariants,
  onChange,
  onRemove,
  onAddAttribute,
  onAttributeChange,
  onRemoveAttribute,
  onSetDefault,
  onImageChange,
  onRemoveImage,
}) {
  const handleFieldChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Variant {index + 1}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Configure pricing, stock and variant images.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {variant.isDefault && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Default Variant
            </span>
          )}

          {totalVariants > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
              title="Remove variant"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
      </div>

      {/* SKU and Pricing */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            SKU *
          </label>

          <input
            type="text"
            value={variant.sku}
            onChange={(e) => handleFieldChange("sku", e.target.value)}
            placeholder="e.g. ANK-EAR-001"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            MRP *
          </label>

          <input
            type="number"
            min="0"
            value={variant.mrp}
            onChange={(e) => handleFieldChange("mrp", e.target.value)}
            placeholder="2999"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Selling Price *
          </label>

          <input
            type="number"
            min="0"
            value={variant.sellingPrice}
            onChange={(e) =>
              handleFieldChange("sellingPrice", e.target.value)
            }
            placeholder="1999"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Stock *
          </label>

          <input
            type="number"
            min="0"
            value={variant.stock}
            onChange={(e) => handleFieldChange("stock", e.target.value)}
            placeholder="25"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Low Stock Threshold
          </label>

          <input
            type="number"
            min="0"
            value={variant.lowStockThreshold}
            onChange={(e) =>
              handleFieldChange("lowStockThreshold", e.target.value)
            }
            placeholder="5"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Attributes */}
      <div className="mt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-900">
            Variant Attributes
          </h4>

          <button
            type="button"
            onClick={() => onAddAttribute(index)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus size={15} />
            Add Attribute
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {variant.attributes.map((attribute, attributeIndex) => (
            <div
              key={attributeIndex}
              className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                type="text"
                value={attribute.key}
                onChange={(e) =>
                  onAttributeChange(
                    index,
                    attributeIndex,
                    "key",
                    e.target.value,
                  )
                }
                placeholder="Attribute (e.g. Color)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <input
                type="text"
                value={attribute.value}
                onChange={(e) =>
                  onAttributeChange(
                    index,
                    attributeIndex,
                    "value",
                    e.target.value,
                  )
                }
                placeholder="Value (e.g. Black)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  onRemoveAttribute(index, attributeIndex)
                }
                disabled={variant.attributes.length === 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Variant Images */}
      <div className="mt-7 border-t border-slate-100 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Variant Images
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              Upload up to 6 images for this variant.
            </p>
          </div>

          <span className="text-xs font-medium text-slate-500">
            {variant.images.length}/6 images
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {variant.images.map((file, imageIndex) => (
            <div key={`${file.name}-${imageIndex}`} className="relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Variant ${index + 1} image ${imageIndex + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => onRemoveImage(index, imageIndex)}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white shadow hover:bg-red-700"
                title="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ))}

          {variant.images.length < 6 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-blue-500 hover:bg-blue-50">
              <Upload size={23} />

              <span className="mt-2 text-xs font-medium">
                Add Images
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => onImageChange(index, e)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Variant Status */}
      <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={variant.isActive}
            onChange={(e) =>
              handleFieldChange("isActive", e.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Active
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            checked={variant.isDefault}
            onChange={() => onSetDefault(index)}
            className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <Star size={15} className="text-amber-500" />
          Default Variant
        </label>
      </div>
    </div>
  );
}
