"use client";

import { useMemo, useCallback } from "react";
import { Check } from "lucide-react";

const normalizeValue = (value) => String(value ?? "").trim().toLowerCase();

const getAttributes = (attributes) => {
  if (!attributes) return [];
  if (attributes instanceof Map) return Array.from(attributes.entries());

  if (Array.isArray(attributes)) {
    return attributes
      .map((item) => {
        if (Array.isArray(item)) return item;
        if (item && typeof item === "object") {
          return [item.key || item.name || item.attribute, item.value];
        }
        return [];
      })
      .filter(([key, value]) => key && value != null);
  }

  if (typeof attributes === "object") return Object.entries(attributes);
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
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return color;
  return "#cbd5e1";
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

const isAvailable = (variant) =>
  variant?.isActive !== false && Number(variant?.stock || 0) > 0;

export default function ProductVariantSelector({
  variants = [],
  selectedVariantId,
  onVariantChange,
}) {
  const activeVariants = useMemo(
    () =>
      Array.isArray(variants)
        ? variants.filter((variant) => variant && variant.isActive !== false)
        : [],
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

  const selectedVariant = useMemo(
    () =>
      variantData.find(
        (variant) => String(variant._id) === String(selectedVariantId)
      ) || null,
    [variantData, selectedVariantId]
  );

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

  const attributeGroups = useMemo(() => {
    const groups = new Map();

    variantData.forEach((variant) => {
      variant.otherAttributes.forEach(([key, value]) => {
        const groupKey = String(key);
        if (!groups.has(groupKey)) groups.set(groupKey, new Set());
        groups.get(groupKey).add(String(value));
      });
    });

    return Array.from(groups.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values),
    }));
  }, [variantData]);

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

  const matchesAttributes = useCallback(
    (variant, targetAttributes) =>
      Object.entries(targetAttributes).every(([targetKey, targetValue]) =>
        variant.otherAttributes.some(
          ([variantKey, variantValue]) =>
            normalizeValue(variantKey) === normalizeValue(targetKey) &&
            normalizeValue(variantValue) === normalizeValue(targetValue)
        )
      ),
    []
  );

  const selectVariant = useCallback(
    (variant) => {
      if (!variant || !isAvailable(variant)) return;
      if (String(variant._id) === String(selectedVariantId)) return;
      onVariantChange?.(variant._id);
    },
    [onVariantChange, selectedVariantId]
  );

  const handleAttributeChange = useCallback(
    (attributeKey, value) => {
      const targetAttributes = {
        ...selectedAttributes,
        [attributeKey]: value,
      };

      const matchingVariant =
        variantData.find((variant) => {
          const matchesColor =
            !selectedVariant?.colorName ||
            normalizeValue(variant.colorName) ===
              normalizeValue(selectedVariant.colorName);
          return (
            matchesColor &&
            matchesAttributes(variant, targetAttributes) &&
            isAvailable(variant)
          );
        }) ||
        variantData.find(
          (variant) =>
            matchesAttributes(variant, { [attributeKey]: value }) &&
            isAvailable(variant)
        );

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

  const handleColorChange = useCallback(
    (color) => {
      const matchingVariants = color.variants.filter(isAvailable);
      if (!matchingVariants.length) return;

      const exactMatch = matchingVariants.find((variant) =>
        matchesAttributes(variant, selectedAttributes)
      );

      selectVariant(exactMatch || matchingVariants[0]);
    },
    [selectedAttributes, matchesAttributes, selectVariant]
  );

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
    [selectedAttributes, selectedVariant, variantData, matchesAttributes]
  );

  if (!variantData.length || (!colorOptions.length && !attributeGroups.length)) {
    return null;
  }

  return (
    <section className="mt-5 w-full space-y-5" aria-label="Product options">
      {/* Color Swatches */}
      {colorOptions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Color:{" "}
              <span className="normal-case tracking-normal text-[#101828]">
                {selectedVariant?.colorName || "Select"}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
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
                  aria-label={`Color ${color.name}${!available ? " (Out of stock)" : ""}`}
                  aria-pressed={isSelected}
                  className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                    isSelected
                      ? "border-[#0755E9] bg-[#EFF6FF] text-[#082B70] ring-1 ring-[#0755E9]"
                      : "border-[#E2E8F0] bg-white text-[#101828] hover:border-[#0755E9]/45"
                  } ${
                    !available
                      ? "cursor-not-allowed opacity-45"
                      : "cursor-pointer"
                  }`}
                >
                  <span
                    className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black/15"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check
                        size={12}
                        strokeWidth={3}
                        className={
                          isLightColor(color.name)
                            ? "text-[#101828]"
                            : "text-white"
                        }
                      />
                    )}
                  </span>

                  <span className="text-xs font-semibold capitalize">
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Attribute Button Groups (Size, Storage, Model, etc.) */}
      {attributeGroups.map((group) => (
        <div key={group.key} className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            {group.key}:{" "}
            <span className="normal-case tracking-normal text-[#101828]">
              {selectedAttributes[group.key] || "Select"}
            </span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const isSelected =
                normalizeValue(selectedAttributes[group.key]) ===
                normalizeValue(value);
              const available = isAttributeValueAvailable(group.key, value);

              return (
                <button
                  key={`${group.key}-${value}`}
                  type="button"
                  disabled={!available}
                  onClick={() => handleAttributeChange(group.key, value)}
                  aria-pressed={isSelected}
                  className={`min-w-16 rounded-xl border px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                    isSelected
                      ? "border-[#0755E9] bg-[#EFF6FF] text-[#0755E9] ring-1 ring-[#0755E9]"
                      : "border-[#E2E8F0] bg-white text-[#101828] hover:border-[#0755E9]/45 hover:bg-[#F8FAFC]"
                  } ${
                    !available
                      ? "cursor-not-allowed opacity-40 line-through"
                      : "cursor-pointer"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
