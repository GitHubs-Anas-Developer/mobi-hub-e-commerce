import Banner from "../models/banner.model.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";

// Create custom error
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validate banner ID
const validateBannerId = (id) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw createError("Invalid banner ID", 400);
  }
};

// Validate banner dates
const validateBannerDates = (data) => {
  const startDate = data.startDate;
  const endDate = data.endDate;

  if (startDate && endDate && startDate > endDate) {
    throw createError("End date must be after start date", 400);
  }
};

// Delete Cloudinary image safely
const deleteBannerImage = async (publicId) => {
  if (!publicId) return;

  try {
    await deleteImage(publicId);
  } catch (error) {
    console.error("Banner image deletion failed:", error.message);
  }
};

// CREATE BANNER
export const createBanner = async (bannerData, files = {}) => {
  const desktopFile = files.desktopImage?.[0];
  const mobileFile = files.mobileImage?.[0];

  if (!desktopFile) {
    throw createError("Desktop banner image is required", 400);
  }

  validateBannerDates(bannerData);

  let desktopUpload;
  let mobileUpload;

  try {
    desktopUpload = await uploadImage(
      desktopFile.buffer,
      "mobi-hub/banners/desktop",
    );

    if (mobileFile) {
      mobileUpload = await uploadImage(
        mobileFile.buffer,
        "mobi-hub/banners/mobile",
      );
    }

    const banner = await Banner.create({
      ...bannerData,
      desktopImage: desktopUpload.url,
      desktopImagePublicId: desktopUpload.publicId,
      mobileImage: mobileUpload?.url || "",
      mobileImagePublicId: mobileUpload?.publicId || "",
    });

    return banner;
  } catch (error) {
    await deleteBannerImage(desktopUpload?.publicId);
    await deleteBannerImage(mobileUpload?.publicId);

    throw error;
  }
};

// GET ALL BANNERS (ADMIN)
export const getAllBanners = async (filters = {}) => {
  const query = {};

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  if (filters.placement) {
    query.placement = filters.placement;
  }

  if (filters.position) {
    query.position = filters.position;
  }

  if (filters.targetCategory) {
    query.targetCategory = filters.targetCategory;
  }

  if (filters.targetSubCategory) {
    query.targetSubCategory = filters.targetSubCategory;
  }

  return Banner.find(query).sort({
    sortOrder: 1,
    createdAt: -1,
  });
};

// GET ACTIVE BANNERS
// Supports page, position, category and subcategory filters
export const getActiveBanners = async (filters = {}) => {
  const now = new Date();

  const query = {
    isActive: true,

    $and: [
      {
        $or: [
          { startDate: null },
          { startDate: { $exists: false } },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: null },
          { endDate: { $exists: false } },
          { endDate: { $gte: now } },
        ],
      },
    ],
  };

  // Page filtering
  if (filters.placement) {
    query.placement = filters.placement;
  }

  // Position filtering
  if (filters.position) {
    query.position = filters.position;
  }

  // Category targeting:
  // Show general banners and banners matching this category
  if (filters.targetCategory) {
    query.$and.push({
      $or: [
        { targetCategory: null },
        { targetCategory: { $exists: false } },
        { targetCategory: filters.targetCategory },
      ],
    });
  }

  // Subcategory targeting:
  // Show general banners and banners matching this subcategory
  if (filters.targetSubCategory) {
    query.$and.push({
      $or: [
        { targetSubCategory: null },
        { targetSubCategory: { $exists: false } },
        { targetSubCategory: filters.targetSubCategory },
      ],
    });
  }

  return Banner.find(query).sort({
    sortOrder: 1,
    createdAt: -1,
  });
};

// GET BANNER BY ID
export const getBannerById = async (id) => {
  validateBannerId(id);

  const banner = await Banner.findById(id);

  if (!banner) {
    throw createError("Banner not found", 404);
  }

  return banner;
};

// UPDATE BANNER
export const updateBanner = async (id, bannerData, files = {}) => {
  validateBannerId(id);

  const banner = await Banner.findById(id);

  if (!banner) {
    throw createError("Banner not found", 404);
  }

  const updatedData = { ...bannerData };

  validateBannerDates({
    startDate: bannerData.startDate ?? banner.startDate,
    endDate: bannerData.endDate ?? banner.endDate,
  });

  const desktopFile = files.desktopImage?.[0];
  const mobileFile = files.mobileImage?.[0];

  const oldDesktopPublicId = banner.desktopImagePublicId;
  const oldMobilePublicId = banner.mobileImagePublicId;

  let newDesktopUpload;
  let newMobileUpload;

  try {
    if (desktopFile) {
      newDesktopUpload = await uploadImage(
        desktopFile.buffer,
        "mobi-hub/banners/desktop",
      );

      updatedData.desktopImage = newDesktopUpload.url;
      updatedData.desktopImagePublicId = newDesktopUpload.publicId;
    }

    if (mobileFile) {
      newMobileUpload = await uploadImage(
        mobileFile.buffer,
        "mobi-hub/banners/mobile",
      );

      updatedData.mobileImage = newMobileUpload.url;
      updatedData.mobileImagePublicId = newMobileUpload.publicId;
    }

    Object.assign(banner, updatedData);

    await banner.save();

    if (newDesktopUpload) {
      await deleteBannerImage(oldDesktopPublicId);
    }

    if (newMobileUpload) {
      await deleteBannerImage(oldMobilePublicId);
    }

    return banner;
  } catch (error) {
    await deleteBannerImage(newDesktopUpload?.publicId);
    await deleteBannerImage(newMobileUpload?.publicId);

    throw error;
  }
};

// DELETE BANNER
export const deleteBanner = async (id) => {
  validateBannerId(id);

  const banner = await Banner.findById(id);

  if (!banner) {
    throw createError("Banner not found", 404);
  }

  await Banner.findByIdAndDelete(id);

  await deleteBannerImage(banner.desktopImagePublicId);
  await deleteBannerImage(banner.mobileImagePublicId);

  return banner;
};
