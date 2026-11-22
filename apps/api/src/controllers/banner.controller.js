import * as bannerService from "../services/banner.service.js";

// CREATE BANNER
export const createBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.createBanner(
      req.validatedData.body,
      req.files,
    );

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL BANNERS (ADMIN)
export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getAllBanners(req.query);

    res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// GET ACTIVE BANNERS (PUBLIC)
export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getActiveBanners(req.query);

    res.status(200).json({
      success: true,
      message: "Active banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    next(error);
  }
};

// GET BANNER BY ID
export const getBannerById = async (req, res, next) => {
  try {
    const banner = await bannerService.getBannerById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE BANNER
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.updateBanner(
      req.params.id,
      req.validatedData.body,
      req.files,
    );

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE BANNER
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await bannerService.deleteBanner(req.params.id);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
};
