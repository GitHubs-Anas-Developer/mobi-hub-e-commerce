import {
  addRecentlyViewed as addRecentlyViewedService,
  getRecentlyViewed as getRecentlyViewedService,
  clearRecentlyViewed as clearRecentlyViewedService,
} from "../services/recentlyViewed.service.js";

// Add recently viewed product
export const addRecentlyViewed = async (req, res, next) => {
  try {
    const result = await addRecentlyViewedService(
      req.user._id,
      req.params.productId,
    );

    return res.status(200).json({
      success: true,
      message: "Product added to recently viewed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get recently viewed products
export const getRecentlyViewed = async (req, res, next) => {
  try {
    const result = await getRecentlyViewedService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Recently viewed products fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Clear recently viewed products
export const clearRecentlyViewed = async (req, res, next) => {
  try {
    const result = await clearRecentlyViewedService(req.user._id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
