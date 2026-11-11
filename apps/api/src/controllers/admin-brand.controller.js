import * as brandService from "../services/brand.service.js";

// 1. Create Brand
export const createBrand = async (req, res, next) => {
  try {
    const brand = await brandService.createBrand(req.validatedData.body);

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Brands
export const getAllBrands = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    if (req.query.search) {
      filters.search = req.query.search;
    }

    const brands = await brandService.getAllBrands(filters);

    res.status(200).json({
      success: true,
      results: brands.length,
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Single Brand
export const getBrandById = async (req, res, next) => {
  try {
    const brand = await brandService.getBrandById(
      req.validatedData.params.brandId,
    );

    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Brand
export const updateBrand = async (req, res, next) => {
  try {
    const brand = await brandService.updateBrand(
      req.validatedData.params.brandId,
      req.validatedData.body,
    );

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Brand
export const deleteBrand = async (req, res, next) => {
  try {
    await brandService.deleteBrand(req.validatedData.params.brandId);

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 6. Toggle Brand Status
export const toggleBrandStatus = async (req, res, next) => {
  try {
    const brand = await brandService.toggleBrandStatus(
      req.validatedData.params.brandId,
    );

    res.status(200).json({
      success: true,
      message: `Brand ${brand.isActive ? "activated" : "deactivated"} successfully`,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};
