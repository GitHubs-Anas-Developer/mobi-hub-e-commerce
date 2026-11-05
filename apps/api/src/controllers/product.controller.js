import * as productService from "../services/product.service.js";

// 1. Create Product
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.validatedData.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Products
export const getAllProducts = async (req, res, next) => {
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

    const result = await productService.getAllProducts(filters);

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

// 3. Get Single Product
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(
      req.validatedData.params.productId,
    );

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Product
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.validatedData.params.productId,
      req.validatedData.body,
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Product
export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.validatedData.params.productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 6. Toggle Product Status
export const toggleProductStatus = async (req, res, next) => {
  try {
    const product = await productService.toggleProductStatus(
      req.validatedData.params.productId,
    );

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
