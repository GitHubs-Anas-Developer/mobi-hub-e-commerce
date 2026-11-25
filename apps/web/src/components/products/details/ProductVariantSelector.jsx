
"use client";

import { useMemo, useCallback } from "react";
import { Check, Package, AlertCircle } from "lucide-react";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const normalizeValue = (value) =>
  String(value ?? "").trim().toLowerCase();

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

const isColorAttribute = (key) =>
  ["color", "colour"].includes(normalizeValue(key));

const getColorHex = (value) => {
  const color = normalizeValue(value);

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
    "natural titanium": "#aaa49b",
    "blue titanium": "#394e66",
    "black titanium": "#333333",
    "white titanium": "#d9d9d6",
  };

  if (colors[color]) return colors[color];

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
    return color;
  }

  return "#d1d5db";
};

const isLightColor = (value) =>
  [
    "white",
    "cream",
    "silver",
    "starlight",
    "lavender",
    "beige",
    "yellow",
  ].includes(normalizeValue(value));

const getStock = (variant) =>
  Math.max(0, Number(variant?.stock || 0));

const isAvailable = (variant) =>
  variant?.isActive !== false && getStock(variant) > 0;

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */

export default function ProductVariantSelector({
  variants = [],
  selectedVariantId,
  onVariantChange,
}) {
  /* Active variants */

  const activeVariants = useMemo(
    () =>
      Array.isArray(variants)
        ? variants.filter(
            (variant) => variant && variant.isActive !== false
          )
        : [],
    [variants]
  );

  /* Normalize variant data */

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

  /* Selected variant */

  const selectedVariant = useMemo(
    () =>
      variantData.find(
        (variant) =>
          String(variant._id) === String(selectedVariantId)
      ) || null,
    [variantData, selectedVariantId]
  );

  /* Group colors */

  const colorOptions = useMemo(() => {
    const colors = new Map();

    variantData.forEach((variant) => {
      if (!variant.colorName) return;

      const key = normalizeValue(variant.colorName);

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

  /* Group other attributes */

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

  /* Current selected attributes */

  const selectedAttributes = useMemo(
    () =>
      selectedVariant
        ? Object.fromEntries(
            selectedVariant.otherAttributes.map(([key, value]) => [
              key,
              String(value),
            ])
          )
        : {},
    [selectedVariant]
  );

  /* Check attribute matching */

  const matchesAttributes = useCallback(
    (variant, targetAttributes) => {
      return Object.entries(targetAttributes).every(
        ([targetKey, targetValue]) =>
          variant.otherAttributes.some(
            ([variantKey, variantValue]) =>
              normalizeValue(variantKey) === normalizeValue(targetKey) &&
              normalizeValue(variantValue) === normalizeValue(targetValue)
          )
      );
    },
    []
  );

  /* Select exact variant */

  const selectVariant = useCallback(
    (variant) => {
      if (!variant || !isAvailable(variant)) return;

      if (String(variant._id) === String(selectedVariantId)) return;

      onVariantChange?.(variant._id);
    },
    [onVariantChange, selectedVariantId]
  );

  /* Change attribute */

  const handleAttributeChange = useCallback(
    (attributeKey, value) => {
      const targetAttributes = {
        ...selectedAttributes,
        [attributeKey]: value,
      };

      const matchingVariant = variantData.find((variant) => {
        const matchesColor =
          !selectedVariant?.colorName ||
          normalizeValue(variant.colorName) ===
            normalizeValue(selectedVariant.colorName);

        return (
          matchesColor &&
          matchesAttributes(variant, targetAttributes) &&
          isAvailable(variant)
        );
      });

      if (matchingVariant) {
        selectVariant(matchingVariant);
      }
    },
    [
      selectedAttributes,
      selectedVariant,
      variantData,
      matchesAttributes,
      selectVariant,
    ]
  );

  /* Change color */

  const handleColorChange = useCallback(
    (color) => {
      const matchingVariants = color.variants.filter(isAvailable);

      if (!matchingVariants.length) return;

      const currentMatch = matchingVariants.find((variant) =>
        matchesAttributes(variant, selectedAttributes)
      );

      const availableVariant = currentMatch || matchingVariants[0];

      selectVariant(availableVariant);
    },
    [selectedAttributes, matchesAttributes, selectVariant]
  );

  /* Attribute availability */

  const isAttributeValueAvailable = useCallback(
    (attributeKey, value) => {
      const targetAttributes = {
        ...selectedAttributes,
        [attributeKey]: value,
      };

      return variantData.some((variant) => {
        const matchesColor =
          !selectedVariant?.colorName ||
          normalizeValue(variant.colorName) ===
            normalizeValue(selectedVariant.colorName);

        return (
          matchesColor &&
          matchesAttributes(variant, targetAttributes) &&
          isAvailable(variant)
        );
      });
    },
    [
      selectedAttributes,
      selectedVariant,
      variantData,
      matchesAttributes,
    ]
  );

  /* Price and stock */

  if (!variantData.length) return null;

  const stock = getStock(selectedVariant);

  const sellingPrice = Number(
    selectedVariant?.sellingPrice || 0
  );

  const mrp = Number(
    selectedVariant?.mrp || sellingPrice
  );

  const discount =
    mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const isLowStock =
    stock > 0 &&
    stock <= Number(selectedVariant?.lowStockThreshold ?? 5);

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <section className="w-full space-y-6">

      {/* Color Selection */}

      {colorOptions.length > 0 && (
        <div className="space-y-3">

          {/* Heading only - right side name removed */}

          <h3 className="text-sm font-semibold text-gray-900">
            Choose Color
          </h3>

          <div className="flex flex-wrap gap-3">

            {colorOptions.map((color) => {
              const isSelected =
                normalizeValue(selectedVariant?.colorName) ===
                normalizeValue(color.name);

              const available = color.variants.some(isAvailable);

              return (
                <button
                  key={normalizeValue(color.name)}
                  type="button"
                  disabled={!available}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Select ${color.name}`}
                  aria-pressed={isSelected}
                  className={`
                    group flex min-w-[68px] flex-col items-center
                    gap-2 rounded-xl p-2 transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                    ${
                      !available
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer"
                    }
                  `}
                >

                  {/* Color Circle */}

                  <span
                    className={`
                      relative flex h-11 w-11 items-center
                      justify-center rounded-full border-2
                      transition-all duration-200
                      ${
                        isSelected
                          ? "border-[#0755e9] ring-2 ring-blue-100 ring-offset-2"
                          : "border-gray-200 group-hover:border-gray-400"
                      }
                    `}
                  >
                    <span
                      className="h-9 w-9 rounded-full border border-black/10"
                      style={{
                        backgroundColor: color.hex,
                      }}
                    />

                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          size={15}
                          strokeWidth={3}
                          className={
                            isLightColor(color.name)
                              ? "text-gray-900"
                              : "text-white"
                          }
                        />
                      </span>
                    )}

                    {!available && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-px w-12 rotate-45 bg-red-500" />
                      </span>
                    )}
                  </span>

                  {/* Color Name Below Circle */}

                  <span
                    className={`
                      max-w-[76px] text-center text-xs
                      font-medium capitalize leading-tight
                      ${
                        isSelected
                          ? "text-[#0755e9]"
                          : "text-gray-600"
                      }
                    `}
                  >
                    {color.name}
                  </span>

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
            Choose {group.key}
          </h3>

          <div className="flex flex-wrap gap-2">

            {group.values.map((value) => {
              const isSelected =
                normalizeValue(selectedAttributes[group.key]) ===
                normalizeValue(value);

              const available = isAttributeValueAvailable(
                group.key,
                value
              );

              return (
                <button
                  key={`${group.key}-${value}`}
                  type="button"
                  disabled={!available}
                  onClick={() =>
                    handleAttributeChange(group.key, value)
                  }
                  aria-pressed={isSelected}
                  className={`
                    min-w-16 rounded-lg border px-4 py-2.5
                    text-sm font-medium transition-all duration-200
                    ${
                      isSelected
                        ? "border-[#0755e9] bg-blue-50 text-[#0755e9] ring-1 ring-[#0755e9]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                    }
                    ${
                      !available
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

      {selectedVariant ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-xs font-medium text-gray-500">
                Selected Variant
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

            <div className="shrink-0 text-right">

              <p className="text-lg font-bold text-gray-950">
                {formatPrice(sellingPrice)}
              </p>

              {mrp > sellingPrice && (
                <p className="text-xs text-gray-400 line-through">
                  {formatPrice(mrp)}
                </p>
              )}

              {discount > 0 && (
                <span className="mt-1 inline-flex rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                  {discount}% OFF
                </span>
              )}

            </div>
          </div>

          {/* Stock Status */}

          <div className="mt-4 border-t border-gray-200 pt-3">

            {stock <= 0 ? (
              <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                <AlertCircle size={15} />
                Out of Stock
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600">
                <AlertCircle size={15} />
                Only {stock} left in stock
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-green-700">
                <Package size={15} />
                In Stock
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">
            Select a product option
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Choose an available color and other options to continue.
          </p>
        </div>
      )}

    </section>
  );
}
