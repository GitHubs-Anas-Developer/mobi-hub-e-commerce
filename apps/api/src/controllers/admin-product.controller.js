import * as productService from "../services/product.service.js";

// Get all products for admin (including inactive products)
export const getAdminProducts = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    if (req.query.isFeatured !== undefined) {
      filters.isFeatured = req.query.isFeatured === "true";
    }

    if (req.query.isNewArrival !== undefined) {
      filters.isNewArrival = req.query.isNewArrival === "true";
    }

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.brand) {
      filters.brand = req.query.brand;
    }

    if (req.query.search) {
      filters.search = req.query.search;
    }

    if (req.query.minPrice !== undefined) {
      filters.minPrice = req.query.minPrice;
    }

    if (req.query.maxPrice !== undefined) {
      filters.maxPrice = req.query.maxPrice;
    }

    if (req.query.sort) {
      filters.sort = req.query.sort;
    }

    if (req.query.page) {
      filters.page = req.query.page;
    }

    if (req.query.limit) {
      filters.limit = req.query.limit;
    }

    const result = await productService.getAdminProducts(filters);

    res.status(200).json({
      success: true,
      results: result.products.length,
      pagination: result.pagination,
      data: result.products,
    });
  } catch (error) {
    next(error);
  }
};
