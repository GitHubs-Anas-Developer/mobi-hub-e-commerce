const cleanText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const generateProductSeoMetadata = (product) => {
  const name = cleanText(product?.name) || "Product";
  const brand = cleanText(product?.brand) || "ELENZO";
  const variants = (product?.variants || []).filter(
    (variant) => variant?.isActive !== false,
  );
  const variant =
    variants.find((item) => item?.isDefault) || variants[0] || {};
  const sku = cleanText(variant.sku) || cleanText(product?.slug) || name;
  const title = `${name} | ${sku}`.slice(0, 180);
  const descriptionPrefix = `Shop ${name} by ${brand} at ELENZO. `;
  const descriptionSuffix = ` SKU ${sku}.`;
  const description = cleanText(product?.description);
  const descriptionBudget = Math.max(
    0,
    300 - descriptionPrefix.length - descriptionSuffix.length,
  );

  return {
    seoTitle: title,
    seoDescription: `${descriptionPrefix}${description.slice(0, descriptionBudget).trimEnd()}${descriptionSuffix}`,
  };
};

export const getProductSeoUpdates = (
  currentProduct,
  updatedProduct,
  updateData,
) => {
  const currentGeneratedSeo = generateProductSeoMetadata(currentProduct);
  const updatedGeneratedSeo = generateProductSeoMetadata(updatedProduct);
  const seoUpdates = {};

  for (const field of ["seoTitle", "seoDescription"]) {
    const suppliedValue = updateData[field];
    const hasSuppliedValue =
      typeof suppliedValue === "string" && suppliedValue.trim().length > 0;
    const currentValue = currentProduct[field]?.trim() || "";
    const explicitlyCleared =
      Object.hasOwn(updateData, field) && !hasSuppliedValue;
    const previouslyGenerated =
      !currentValue || currentValue === currentGeneratedSeo[field];

    if (hasSuppliedValue) {
      const unchangedGeneratedValue =
        previouslyGenerated && suppliedValue.trim() === currentValue;
      seoUpdates[field] = unchangedGeneratedValue
        ? updatedGeneratedSeo[field]
        : suppliedValue.trim();
    } else if (explicitlyCleared || previouslyGenerated) {
      seoUpdates[field] = updatedGeneratedSeo[field];
    }
  }

  return seoUpdates;
};
