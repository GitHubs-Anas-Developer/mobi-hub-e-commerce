
"use client";

import { useMemo } from "react";
import { Check, Package, AlertCircle } from "lucide-react";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const getAttributes = (attributes) => {
  if (!attributes) return [];

  if (attributes instanceof Map) {
    return Array.from(attributes.entries());
  }

  if (Array.isArray(attributes)) {
    return attributes
      .map((item) => {
        if (Array.isArray(item)) return item;

        if (item && typeof item === "object") {
          return [
            item.key || item.name || item.attribute,
            item.value,
          ];
        }

        return [];
      })
      .filter(([key, value]) => key && value != null);
  }

  if (typeof attributes === "object") {
    return Object.entries(attributes);
  }

  return [];
};

const getColorHex = (value) => {
  const color = String(value || "").trim().toLowerCase();

  const colors = {
    black: "#171717",
    white: "#ffffff",
    red: "#ef4444",
    blue: "#2563eb",
    navy: "#1e3a8a",
    green: "#16a34a",
    yellow: "#eab308",
    orange: "#f97316",
    pink: "#ec4899",
    purple: "#9333ea",
    violet: "#8b5cf6",
    grey: "#9ca3af",
    gray: "#9ca3af",
    silver: "#c0c0c0",
    gold: "#d4a017",
    brown: "#92400e",
    beige: "#d6c2a1",
    cream: "#fffdd0",
    cyan: "#06b6d4",
    teal: "#0d9488",
    maroon: "#800000",
    lavender: "#e6e6fa",
    graphite: "#4b5563",
    "space grey": "#71717a",
    "space gray": "#71717a",
    "rose gold": "#b76e79",
    "sky blue": "#87ceeb",
    "forest green": "#228b22",
    "navy blue": "#1e3a8a",
    starlight: "#f5e6ca",
    midnight: "#191970",
  };

  if (colors[color]) return colors[color];

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
    return color;
  }

  return "#d1d5db";
};

const isColorAttribute = (key) =>
  ["color", "colour"].includes(String(key).toLowerCase());

export default function ProductVariantSelector({
  variants = [],
  selectedVariantId,
  onVariantChange,
}) {
  const activeVariants = useMemo(
    () => variants.filter((variant) => variant?.isActive !== false),
    [variants]
  );

  const variantData = useMemo(
    () =>
      activeVariants.map((variant) => {
        const attributes = getAttributes(variant.attributes);

        const colorAttribute = attributes.find(([key]) =>
          isColorAttribute(key)
        );

        return {
          ...variant,
          attributes,
          colorName: colorAttribute?.[1] || null,
          otherAttributes: attributes.filter(
            ([key]) => !isColorAttribute(key)
          ),
        };
      }),
    [activeVariants]
  );

  const selectedVariant =
    variantData.find(
      (variant) =>
        String(variant._id) === String(selectedVariantId)
    ) || null;

  // Group variants by color.
  const colorOptions = useMemo(() => {
    const colors = new Map();

    variantData.forEach((variant) => {
      if (!variant.colorName) return;

      const key = String(variant.colorName).toLowerCase();

      if (!colors.has(key)) {
        colors.set(key, {
          name: variant.colorName,
          hex: getColorHex(variant.colorName),
          variants: [],
        });
      }

      colors.get(key).variants.push(variant);
    });

    return Array.from(colors.values());
  }, [variantData]);

  // Find available values for each non-color attribute.
  const attributeGroups = useMemo(() => {
    const groups = new Map();

    variantData.forEach((variant) => {
      variant.otherAttributes.forEach(([key, value]) => {
        const groupKey = String(key);

        if (!groups.has(groupKey)) {
          groups.set(groupKey, new Set());
        }

        groups.get(groupKey).add(String(value));
      });
    });

    return Array.from(groups.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values),
    }));
  }, [variantData]);

  const selectedAttributes = selectedVariant
    ? Object.fromEntries(selectedVariant.otherAttributes)
    : {};

  const handleAttributeChange = (attributeKey, value) => {
    const targetAttributes = {
      ...selectedAttributes,
      [attributeKey]: value,
    };

    const matchingVariant = variantData.find((variant) => {
      return Object.entries(targetAttributes).every(
        ([key, targetValue]) =>
          variant.otherAttributes.some(
            ([variantKey, variantValue]) =>
              String(variantKey).toLowerCase() ===
                String(key).toLowerCase() &&
              String(variantValue) === String(targetValue)
          )
      );
    });

    if (matchingVariant && Number(matchingVariant.stock || 0) > 0) {
      onVariantChange?.(matchingVariant._id);
    }
  };

  const handleColorChange = (color) => {
    const matchingVariants = color.variants;

    const currentMatch = matchingVariants.find((variant) => {
      return variant.otherAttributes.every(([key, value]) =>
        selectedVariant?.otherAttributes.some(
          ([selectedKey, selectedValue]) =>
            String(selectedKey).toLowerCase() ===
              String(key).toLowerCase() &&
            String(selectedValue) === String(value)
        )
      );
    });

    const availableVariant = currentMatch && Number(currentMatch.stock || 0) > 0
      ? currentMatch
      : matchingVariants.find(
          (variant) => Number(variant.stock || 0) > 0
        );

    if (availableVariant) {
      onVariantChange?.(availableVariant._id);
    }
  };

  if (!variantData.length) return null;

  const stock = Number(selectedVariant?.stock || 0);
  const sellingPrice = Number(
    selectedVariant?.sellingPrice || 0
  );
  const mrp = Number(selectedVariant?.mrp || sellingPrice);

  const discount =
    mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const isLowStock =
    stock > 0 &&
    stock <= Number(selectedVariant?.lowStockThreshold ?? 5);

  return (
    <section className="w-full space-y-5">

      {/* Color Selection */}
      {colorOptions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Color
            </h3>

            {selectedVariant?.colorName && (
              <span className="text-sm font-medium text-gray-600">
                {selectedVariant.colorName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {colorOptions.map((color) => {
              const isSelected =
                String(selectedVariant?.colorName || "").toLowerCase() ===
                String(color.name).toLowerCase();

              const isAvailable = color.variants.some(
                (variant) => Number(variant.stock || 0) > 0
              );

              return (
                <button
                  key={color.name}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleColorChange(color)}
                  title={color.name}
                  aria-label={`Select ${color.name}`}
                  aria-pressed={isSelected}
                  className={`
                    relative flex h-10 w-10 items-center justify-center
                    rounded-full border-2 transition-all
                    ${
                      isSelected
                        ? "border-[#0755e9] ring-2 ring-blue-100 ring-offset-2"
                        : "border-gray-200 hover:border-gray-400"
                    }
                    ${
                      !isAvailable
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <span
                    className="h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: color.hex }}
                  />

                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check
                        size={14}
                        strokeWidth={3}
                        className={
                          ["white", "cream", "silver", "starlight"].includes(
                            String(color.name).toLowerCase()
                          )
                            ? "text-gray-900"
                            : "text-white"
                        }
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Attributes */}
      {attributeGroups.map((group) => (
        <div key={group.key} className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {group.key}
          </h3>

          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const isSelected =
                String(selectedAttributes[group.key] || "") === value;

              const isAvailable = variantData.some((variant) => {
                const matchesColor =
                  !selectedVariant?.colorName ||
                  String(variant.colorName).toLowerCase() ===
                    String(selectedVariant.colorName).toLowerCase();

                const matchesValue = variant.otherAttributes.some(
                  ([key, variantValue]) =>
                    String(key).toLowerCase() ===
                      group.key.toLowerCase() &&
                    String(variantValue) === value
                );

                return (
                  matchesColor &&
                  matchesValue &&
                  Number(variant.stock || 0) > 0
                );
              });

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() =>
                    handleAttributeChange(group.key, value)
                  }
                  className={`
                    min-w-16 rounded-lg border px-4 py-2.5
                    text-sm font-medium transition-all
                    ${
                      isSelected
                        ? "border-[#0755e9] bg-blue-50 text-[#0755e9]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                    }
                    ${
                      !isAvailable
                        ? "cursor-not-allowed opacity-40 line-through"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Summary */}
      {selectedVariant && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">
                Selected variant
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {[
                  selectedVariant.colorName,
                  ...selectedVariant.otherAttributes.map(
                    ([key, value]) => `${key}: ${value}`
                  ),
                ]
                  .filter(Boolean)
                  .join(" / ") || "Standard"}
              </p>

              {selectedVariant.sku && (
                <p className="mt-1 text-xs text-gray-400">
                  SKU: {selectedVariant.sku}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-gray-950">
                {formatPrice(sellingPrice)}
              </p>

              {mrp > sellingPrice && (
                <p className="text-xs text-gray-400 line-through">
                  {formatPrice(mrp)}
                </p>
              )}

              {discount > 0 && (
                <p className="mt-1 text-xs font-semibold text-green-700">
                  {discount}% OFF
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 border-t border-gray-200 pt-3">
            {stock <= 0 ? (
              <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                <AlertCircle size={14} />
                Out of stock
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600">
                <AlertCircle size={14} />
                Only {stock} left
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-green-700">
                <Package size={14} />
                In stock
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedVariant && (
        <p className="text-xs text-gray-500">
          Select an available product option.
        </p>
      )}
    </section>
  );
}
