import Brand from "../models/brand.model.js";
import Product from "../models/product.model.js";

// Custom service error
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// 1. Create Brand
export const createBrand = async (brandData) => {
  const { name } = brandData;

  const normalizedName = name.trim();

  const existingBrand = await Brand.findOne({
    name: { $regex: `^${normalizedName}$`, $options: "i" },
  });

  if (existingBrand) {
    throw createError("Brand already exists", 409);
  }

  return await Brand.create(brandData);
};

// 2. Get All Brands
export const getAllBrands = async (filters = {}) => {
  const query = {};

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (filters.search) {
    query.name = {
      $regex: filters.search.trim(),
      $options: "i",
    };
  }

  return await Brand.find(query).sort({ createdAt: -1 });
};

// 3. Get Single Brand
export const getBrandById = async (brandId) => {
  const brand = await Brand.findById(brandId);

  if (!brand) {
    throw createError("Brand not found", 404);
  }

  return brand;
};

// 4. Update Brand
export const updateBrand = async (brandId, updateData) => {
  const brand = await Brand.findById(brandId);

  if (!brand) {
    throw createError("Brand not found", 404);
  }

  if (updateData.name) {
    const normalizedName = updateData.name.trim();

    const existingBrand = await Brand.findOne({
      name: { $regex: `^${normalizedName}$`, $options: "i" },
      _id: { $ne: brandId },
    });

    if (existingBrand) {
      throw createError("Brand name already exists", 409);
    }

    // Prevent renaming a brand used by existing products
    if (normalizedName !== brand.name) {
      const hasProducts = await Product.exists({
        brand: brand.name,
      });

      if (hasProducts) {
        throw createError(
          "Cannot rename this brand while products are assigned to it. Update those products first.",
        );
      }
    }
  }

  Object.assign(brand, updateData);

  await brand.save();

  return brand;
};

// 5. Delete Brand
export const deleteBrand = async (brandId) => {
  const brand = await Brand.findById(brandId);

  if (!brand) {
    throw createError("Brand not found", 404);
  }

  const hasProducts = await Product.exists({
    brand: brand.name,
  });

  if (hasProducts) {
    throw createError("Cannot delete brand while products are assigned to it");
  }

  await Brand.findByIdAndDelete(brandId);

  return brand;
};

// 6. Toggle Brand Status
export const toggleBrandStatus = async (brandId) => {
  const brand = await Brand.findById(brandId);

  if (!brand) {
    throw createError("Brand not found", 404);
  }

  brand.isActive = !brand.isActive;

  await brand.save();

  return brand;
};
