
export const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const getProduct = (item) =>
  item?.product || item?.productId || {};

export const getVariant = (item) => {
  if (item?.variantId && typeof item.variantId === "object") {
    return item.variantId;
  }

  const product = getProduct(item);

  return product?.variants?.find(
    (variant) => String(variant?._id) === String(item?.variantId)
  );
};

export const getItemPrice = (item) => {
  const product = getProduct(item);
  const variant = getVariant(item);

  return Number(
    variant?.sellingPrice ??
      variant?.price ??
      product?.sellingPrice ??
      product?.basePrice ??
      product?.price ??
      0
  );
};

export const getItemStock = (item) => {
  const product = getProduct(item);
  const variant = getVariant(item);

  return Number(
    variant?.stock ??
      variant?.quantity ??
      product?.stock ??
      product?.quantity ??
      99
  );
};

export const getProductImage = (product) =>
  product?.thumbnail?.url ||
  product?.thumbnail ||
  product?.images?.[0]?.url ||
  product?.images?.[0] ||
  "";

export const getVariantLabel = (item) => {
  const variant = getVariant(item);

  if (!variant) return "";

  if (variant.name) return variant.name;

  if (Array.isArray(variant.attributes)) {
    return variant.attributes
      .map((attribute) =>
        typeof attribute === "string"
          ? attribute
          : `${attribute?.name || ""}: ${attribute?.value || ""}`
      )
      .filter(Boolean)
      .join(" · ");
  }

  return "";
};
