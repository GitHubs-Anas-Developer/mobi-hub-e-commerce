import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

// Custom service error
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate category
const validateCategory = async (categoryId) => {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw createError("Invalid category ID");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw createError("Category not found", 404);
  }

  if (!category.isActive) {
    throw createError("Cannot assign product to an inactive category");
  }
};

// Validate variant SKUs
const validateVariantSkus = async (variants, currentProductId = null) => {
  if (!variants?.length) return;

  const skus = variants.map((variant) => variant.sku.toUpperCase());

  // Check duplicate SKUs within the same product
  if (new Set(skus).size !== skus.length) {
    throw createError("Duplicate variant SKU found");
  }

  // Check SKU conflicts with other products
  const query = {
    "variants.sku": { $in: skus },
  };

  if (currentProductId) {
    query._id = { $ne: currentProductId };
  }

  const existingProduct = await Product.findOne(query);

  if (existingProduct) {
    throw createError("One or more variant SKUs already exist", 409);
  }
};

// Generate product slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// 1. Create Product
export const createProduct = async (productData) => {
  const { category, variants, name } = productData;

  await validateCategory(category);
  await validateVariantSkus(variants);

  const slug = generateSlug(name);

  if (!slug) {
    throw createError("Invalid product name");
  }

  const existingProduct = await Product.findOne({ slug });

  if (existingProduct) {
    throw createError("Product already exists", 409);
  }

  return await Product.create(productData);
};

// 2. Get All Active Products (Public)
export const getAllProducts = async (filters = {}) => {
  const query = {
    isActive: true,
  };

  if (typeof filters.isFeatured === "boolean") {
    query.isFeatured = filters.isFeatured;
  }

  if (typeof filters.isNewArrival === "boolean") {
    query.isNewArrival = filters.isNewArrival;
  }

  if (filters.category) {
    if (!mongoose.isValidObjectId(filters.category)) {
      throw createError("Invalid category ID");
    }

    query.category = filters.category;
  }

  if (filters.brand) {
    query.brand = filters.brand;
  }

  if (filters.search?.trim()) {
    query.$text = { $search: filters.search.trim() };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.basePrice = {};

    if (filters.minPrice !== undefined) {
      query.basePrice.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query.basePrice.$lte = Number(filters.maxPrice);
    }
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priceLowToHigh: { basePrice: 1 },
    priceHighToLow: { basePrice: -1 },
    nameAZ: { name: 1 },
    nameZA: { name: -1 },
  };

  const sort = sortOptions[filters.sort] || { createdAt: -1 };

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit),

    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// 3. Get Single Active Product (Public)
export const getProductById = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw createError("Invalid product ID");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).populate("category", "name slug");

  if (!product) {
    throw createError("Product not found", 404);
  }

  return product;
};

// 4. Get Single Active Product by Slug (Public)
export const getProductBySlug = async (slug) => {
  if (!slug || typeof slug !== "string") {
    throw createError("Invalid product slug");
  }

  const product = await Product.findOne({
    slug: slug.toLowerCase().trim(),
    isActive: true,
  }).populate("category", "name slug");

  if (!product) {
    throw createError("Product not found", 404);
  }

  return product;
};

// 4. Update Product (Admin)
export const updateProduct = async (productId, updateData) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw createError("Invalid product ID");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw createError("Product not found", 404);
  }

  if (updateData.category !== undefined) {
    await validateCategory(updateData.category);
  }

  if (updateData.variants !== undefined) {
    await validateVariantSkus(updateData.variants, productId);
  }

  if (updateData.name) {
    const slug = generateSlug(updateData.name);

    if (!slug) {
      throw createError("Invalid product name");
    }

    const existingProduct = await Product.findOne({
      slug,
      _id: { $ne: productId },
    });

    if (existingProduct) {
      throw createError("Product name already exists", 409);
    }
  }

  Object.assign(product, updateData);

  await product.save();

  return product;
};

// 5. Delete Product (Admin)
export const deleteProduct = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw createError("Invalid product ID");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw createError("Product not found", 404);
  }

  await Product.findByIdAndDelete(productId);

  return product;
};

// 6. Toggle Product Status (Admin)
export const toggleProductStatus = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throw createError("Invalid product ID");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw createError("Product not found", 404);
  }

  product.isActive = !product.isActive;

  await product.save();

  return product;
};
