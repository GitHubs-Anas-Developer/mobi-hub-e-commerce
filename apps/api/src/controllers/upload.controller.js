import { uploadImage } from "../services/cloudinary.service.js";

const allowedFolders = {
  products: "mobi-hub/products",
  categories: "mobi-hub/categories",
  brands: "mobi-hub/brands",
  banners: "mobi-hub/banners",
};

// Upload images
export const uploadImages = async (req, res, next) => {
  try {
    const { type } = req.body;

    const folder = allowedFolders[type];

    if (!folder) {
      const error = new Error("Invalid image upload type");
      error.statusCode = 400;
      throw error;
    }

    if (!req.files || req.files.length === 0) {
      const error = new Error("Please select at least one image");
      error.statusCode = 400;
      throw error;
    }

    const uploadedImages = await Promise.all(
      req.files.map((file) => uploadImage(file.buffer, folder)),
    );

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      results: uploadedImages.length,
      data: uploadedImages,
    });
  } catch (error) {
    next(error);
  }
};
