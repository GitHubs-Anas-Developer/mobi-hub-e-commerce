"use client";

import { useMemo } from "react";
import { Alert, Button, Card, Tag } from "antd";
import { Layers, Plus } from "lucide-react";
import ProductVariantCard from "./ProductVariantCard";

export default function ProductVariantsSection({
  variants = [],
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  onAddAttribute,
  onAttributeChange,
  onRemoveAttribute,
  onSetDefault,
  onVariantImageChange,
  onRemoveVariantImage,
  onQuickAddAttribute,
  variantErrors = {},
  sectionError = "",
}) {
  const stats = useMemo(() => {
    const active = variants.filter((v) => v.isActive);
    const totalStock = active.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0,
    );
    const prices = active
      .map((v) => Number(v.sellingPrice))
      .filter((p) => Number.isFinite(p) && p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;

    return {
      total: variants.length,
      activeCount: active.length,
      totalStock,
      minPrice,
    };
  }, [variants]);

  return (
    <Card
      className="!border-[#E2E8F0] shadow-xs"
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <Layers size={17} />
            </div>
            <div>
              <h2 className="!m-0 text-base font-bold text-[#101828]">
                Pricing, Inventory & Product Variants
              </h2>
              <p className="mt-0.5 text-xs font-normal text-[#64748B]">
                Configure SKUs, MRP & sale prices, stock quantities, attributes (Color, Storage, Size, Model), and variant photos.
              </p>
            </div>
          </div>

          <Button
            type="primary"
            ghost
            icon={<Plus size={15} />}
            onClick={onAddVariant}
          >
            Add Variant
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Live Variant Aggregate Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs">
          <Tag color="blue" className="!m-0">
            {stats.total} Variant{stats.total === 1 ? "" : "s"} ({stats.activeCount} Active)
          </Tag>
          <Tag color={stats.totalStock > 0 ? "green" : "red"} className="!m-0">
            Total Active Stock: {stats.totalStock} units
          </Tag>
          {stats.minPrice > 0 && (
            <Tag color="default" className="!m-0">
              Starting Price: ₹{stats.minPrice.toLocaleString("en-IN")}
            </Tag>
          )}
          <span className="text-[#64748B] sm:ml-auto">
            Exactly one active variant must be set as Default.
          </span>
        </div>

        {sectionError && (
          <Alert type="error" showIcon title={sectionError} />
        )}

        {/* Variant Cards */}
        <div className="space-y-4">
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
              onQuickAddAttribute={onQuickAddAttribute}
              onSetDefault={onSetDefault}
              onImageChange={onVariantImageChange}
              onRemoveImage={onRemoveVariantImage}
              errors={variantErrors[index] || {}}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
