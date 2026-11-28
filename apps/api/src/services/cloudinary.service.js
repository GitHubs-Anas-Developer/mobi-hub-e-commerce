import cloudinary from "../config/cloudinary.js";

// Upload image buffer to Cloudinary
export const uploadImage = (buffer, folder = "mobi-hub/products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  if (!publicId) {
    throw new Error("Image public ID is required");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  return result;
};

export const deleteImages = async (publicIds = []) => {
  if (publicIds.some((id) => typeof id !== "string" || !id.startsWith("mobi-hub/products/"))) {
    const error = new Error("Only product image assets can be deleted");
    error.statusCode = 400;
    throw error;
  }
  const ids = [...new Set(publicIds)];
  return Promise.all(ids.map((publicId) => deleteImage(publicId)));
};
