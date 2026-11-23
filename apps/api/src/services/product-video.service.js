import { Readable } from "stream";

import ProductVideo from "../models/product-video.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

// Cloudinary video upload helper
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mobi-hub/product-videos",
        resource_type: "video",
        allowed_formats: ["mp4", "webm", "mov"],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

// Cloudinary video delete helper
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
  });
};

// Create product video
export const createProductVideoService = async (data, file, adminId) => {
  if (!file) {
    throw new Error("Video file is required");
  }

  const product = await Product.findById(data.productId);

  if (!product) {
    throw new Error("Product not found");
  }

  let uploadedVideo;

  try {
    uploadedVideo = await uploadToCloudinary(file);

    const thumbnailUrl = cloudinary.url(uploadedVideo.public_id, {
      resource_type: "video",
      format: "jpg",
      transformation: [{ width: 600, height: 800, crop: "fill" }],
    });

    const video = await ProductVideo.create({
      product: product._id,
      title: data.title,
      description: data.description,
      videoUrl: uploadedVideo.secure_url,
      publicId: uploadedVideo.public_id,
      thumbnailUrl,
      duration: uploadedVideo.duration || 0,
      uploadedBy: adminId,
    });

    return video.populate("product");
  } catch (error) {
    // Prevent orphaned Cloudinary uploads if MongoDB save fails.
    if (uploadedVideo?.public_id) {
      await deleteFromCloudinary(uploadedVideo.public_id).catch(
        (cleanupError) => {
          console.error("Cloudinary cleanup failed:", cleanupError);
        },
      );
    }

    throw error;
  }
};

// Get active videos for public feed
export const getActiveProductVideosService = async ({
  page = 1,
  limit = 10,
  productId,
}) => {
  const filter = { isActive: true };

  if (productId) {
    filter.product = productId;
  }

  const skip = (page - 1) * limit;

  const [videos, total] = await Promise.all([
    ProductVideo.find(filter)
      .populate("product", "name slug price thumbnail images basePrice")
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    ProductVideo.countDocuments(filter),
  ]);

  return {
    videos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
};

// Get all videos for admin
export const getAllProductVideosService = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [videos, total] = await Promise.all([
    ProductVideo.find()
      .populate("product", "name slug basePrice")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    ProductVideo.countDocuments(),
  ]);

  return {
    videos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
};

// Get video by ID
export const getProductVideoByIdService = async (id) => {
  const video = await ProductVideo.findById(id)
    .populate("product")
    .populate("uploadedBy", "name email");

  if (!video) {
    throw new Error("Product video not found");
  }

  return video;
};

// Update video
export const updateProductVideoService = async (id, data) => {
  const video = await ProductVideo.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  ).populate("product");

  if (!video) {
    throw new Error("Product video not found");
  }

  return video;
};

// Delete video
export const deleteProductVideoService = async (id) => {
  const video = await ProductVideo.findById(id);

  if (!video) {
    throw new Error("Product video not found");
  }

  await deleteFromCloudinary(video.publicId);

  await video.deleteOne();

  return {
    message: "Product video deleted successfully",
  };
};
