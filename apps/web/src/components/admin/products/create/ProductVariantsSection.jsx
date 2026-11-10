
"use client";

import { Plus, Layers } from "lucide-react";
import ProductVariantCard from "./ProductVariantCard";

export default function ProductVariantsSection({
  variants,
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  onAddAttribute,
  onAttributeChange,
  onRemoveAttribute,
  onSetDefault,
  onVariantImageChange,
  onRemoveVariantImage,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />

            <h2 className="text-lg font-semibold text-slate-900">
              Product Variants
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage different versions of this product.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddVariant}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={17} />
          Add Variant
        </button>
      </div>

      {/* Variants */}
      <div className="mt-6 space-y-5">
        {variants.map((variant, index) => (
          <ProductVariantCard
            key={index}
            variant={variant}
            index={index}
            totalVariants={variants.length}
            onChange={onVariantChange}
            onRemove={onRemoveVariant}
            onAddAttribute={onAddAttribute}
            onAttributeChange={onAttributeChange}
            onRemoveAttribute={onRemoveAttribute}
            onSetDefault={onSetDefault}
            onImageChange={onVariantImageChange}
            onRemoveImage={onRemoveVariantImage}
          />
        ))}
      </div>

      <p className="mt-5 text-xs text-slate-500">
        At least one active default variant is required for a product.
      </p>
    </section>
  );
}
