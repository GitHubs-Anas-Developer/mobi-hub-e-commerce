import mongoose from "mongoose";
import Category from "../models/category.model.js";

// Custom service error
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate parent category
const validateParentCategory = async (
  parentCategory,
  currentCategoryId = null,
) => {
  if (!parentCategory) return;

  if (!mongoose.isValidObjectId(parentCategory)) {
    throw createError("Invalid parent category ID");
  }

  if (
    currentCategoryId &&
    parentCategory.toString() === currentCategoryId.toString()
  ) {
    throw createError("Category cannot be its own parent");
  }

  const parent = await Category.findById(parentCategory);

  if (!parent) {
    throw createError("Parent category not found", 404);
  }

  if (parent.parentCategory) {
    throw createError("Only main categories can be parent categories");
  }

  if (!parent.isActive) {
    throw createError("Parent category is inactive");
  }
};

// 1. Create Category
export const createCategory = async (categoryData) => {
  const { name, parentCategory = null } = categoryData;

  await validateParentCategory(parentCategory);

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existingCategory = await Category.findOne({ slug });

  if (existingCategory) {
    throw createError("Category already exists", 409);
  }

  return await Category.create(categoryData);
};

// 2. Get All Categories
export const getAllCategories = async (filters = {}) => {
  const query = {};

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (filters.parentCategory !== undefined) {
    query.parentCategory = filters.parentCategory;
  }

  return await Category.find(query)
    .populate("parentCategory", "name slug")
    .sort({ sortOrder: 1, createdAt: -1 });
};

// 3. Get Single Category
export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId).populate(
    "parentCategory",
    "name slug",
  );

  if (!category) {
    throw createError("Category not found", 404);
  }

  return category;
};

// 4. Update Category
export const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw createError("Category not found", 404);
  }

  if (updateData.parentCategory !== undefined) {
    await validateParentCategory(updateData.parentCategory, categoryId);
  }

  if (
    updateData.name &&
    updateData.name.toLowerCase().trim() !== category.name.toLowerCase().trim()
  ) {
    const slug = updateData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingCategory = await Category.findOne({
      slug,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      throw createError("Category name already exists", 409);
    }
  }

  // Prevent converting a parent category into a subcategory
  if (updateData.parentCategory) {
    const hasChildren = await Category.exists({
      parentCategory: categoryId,
    });

    if (hasChildren) {
      throw createError(
        "Remove or reassign subcategories before changing this parent",
      );
    }
  }

  Object.assign(category, updateData);

  await category.save();

  return category;
};

// 5. Delete Category
export const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw createError("Category not found", 404);
  }

  const hasChildren = await Category.exists({
    parentCategory: categoryId,
  });

  if (hasChildren) {
    throw createError("Cannot delete category while subcategories exist");
  }

  await Category.findByIdAndDelete(categoryId);

  return category;
};

// 6. Toggle Category Status
export const toggleCategoryStatus = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw createError("Category not found", 404);
  }

  const newStatus = !category.isActive;

  if (!newStatus) {
    const hasActiveChildren = await Category.exists({
      parentCategory: categoryId,
      isActive: true,
    });

    if (hasActiveChildren) {
      throw createError(
        "Deactivate subcategories before deactivating this category",
      );
    }
  }

  category.isActive = newStatus;

  await category.save();

  return category;
};
