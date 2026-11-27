export const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const getProduct = (item) =>
  item?.product || item?.productId || {};

export const getVariant = (item) => {
  if (item?.variantId && typeof item.variantId === "object") {
    return item.variantId;
  }

  const product = getProduct(item);

  return (
    product?.variants?.find(
      (variant) => String(variant?._id) === String(item?.variantId)
    ) || null
  );
};

export const getItemPrice = (item) => {
  const product = getProduct(item);
  const variant = getVariant(item);

  return Math.max(
    0,
    Number(
      variant?.sellingPrice ??
        variant?.price ??
        product?.sellingPrice ??
        product?.basePrice ??
        product?.price ??
        0
    )
  );
};

export const getItemMrp = (item) => {
  const product = getProduct(item);
  const variant = getVariant(item);
  const sellingPrice = getItemPrice(item);

  const rawMrp = Number(
    variant?.mrp ?? product?.mrp ?? sellingPrice
  );

  return rawMrp > sellingPrice ? rawMrp : sellingPrice;
};

export const getItemDiscountPercent = (item) => {
  const sellingPrice = getItemPrice(item);
  const mrp = getItemMrp(item);

  if (mrp > sellingPrice && mrp > 0) {
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  }

  return 0;
};

export const getItemStock = (item) => {
  const product = getProduct(item);
  const variant = getVariant(item);

  if (product?.isActive === false || variant?.isActive === false) {
    return 0;
  }

  if (variant?.stock !== undefined && variant?.stock !== null) {
    return Math.max(0, Number(variant.stock) || 0);
  }

  if (variant?.quantity !== undefined && variant?.quantity !== null) {
    return Math.max(0, Number(variant.quantity) || 0);
  }

  if (product?.totalStock !== undefined && product?.totalStock !== null) {
    return Math.max(0, Number(product.totalStock) || 0);
  }

  if (product?.stock !== undefined && product?.stock !== null) {
    return Math.max(0, Number(product.stock) || 0);
  }

  return 99;
};

export const getProductImage = (product) =>
  product?.thumbnail?.url ||
  (typeof product?.thumbnail === "string" ? product.thumbnail : "") ||
  product?.images?.[0]?.url ||
  (typeof product?.images?.[0] === "string" ? product.images[0] : "") ||
  "";

export const getVariantLabel = (item) => {
  const variant = getVariant(item);

  if (!variant) return "";

  if (variant.name) return String(variant.name).trim();

  if (Array.isArray(variant.attributes)) {
    return variant.attributes
      .map((attribute) =>
        typeof attribute === "string"
          ? attribute
          : attribute?.name && attribute?.value
            ? `${attribute.name}: ${attribute.value}`
            : ""
      )
      .filter(Boolean)
      .join(" · ");
  }

  if (variant.attributes && typeof variant.attributes === "object") {
    return Object.entries(variant.attributes)
      .map(([key, value]) =>
        key && value ? `${key}: ${value}` : String(value || "")
      )
      .filter(Boolean)
      .join(" · ");
  }

  return variant.sku ? `SKU: ${variant.sku}` : "";
};
