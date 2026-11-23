import {
  createProductVideoService,
  getActiveProductVideosService,
  getAllProductVideosService,
  getProductVideoByIdService,
  updateProductVideoService,
  deleteProductVideoService,
} from "../services/product-video.service.js";

// Upload product video
export const uploadProductVideo = async (req, res, next) => {
  try {
    const video = await createProductVideoService(
      req.validatedData.body,
      req.file,
      req.user?._id,
    );

    return res.status(201).json({
      success: true,
      message: "Product video uploaded successfully",
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// Get active product videos (Public)
export const getActiveProductVideos = async (req, res, next) => {
  try {
    const { page, limit, productId } = req.validatedData.query;

    const result = await getActiveProductVideosService({
      page,
      limit,
      productId,
    });

    return res.status(200).json({
      success: true,
      message: "Product videos fetched successfully",
      data: result.videos,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get all product videos (Admin)
export const getAllProductVideos = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 30);

    const result = await getAllProductVideosService({
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "All product videos fetched successfully",
      data: result.videos,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get product video by ID (Admin)
export const getProductVideoById = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    const video = await getProductVideoByIdService(id);

    return res.status(200).json({
      success: true,
      message: "Product video fetched successfully",
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// Update product video (Admin)
export const updateProductVideo = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;
    const updateData = req.validatedData.body;

    const video = await updateProductVideoService(id, updateData);

    return res.status(200).json({
      success: true,
      message: "Product video updated successfully",
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product video (Admin)
export const deleteProductVideo = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    const result = await deleteProductVideoService(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
