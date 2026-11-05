
import * as categoryService from "../services/category.service.js";

// 1. Create Category
export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(
      req.validatedData.body,
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Categories
export const getAllCategories = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    if (req.query.parentCategory !== undefined) {
      filters.parentCategory = req.query.parentCategory || null;
    }

    const categories = await categoryService.getAllCategories(filters);

    res.status(200).json({
      success: true,
      results: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Single Category
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(
      req.validatedData.params.categoryId,
    );

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Category
export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.validatedData.params.categoryId,
      req.validatedData.body,
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Category
export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(
      req.validatedData.params.categoryId,
    );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 6. Toggle Category Status
export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await categoryService.toggleCategoryStatus(
      req.validatedData.params.categoryId,
    );

    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
