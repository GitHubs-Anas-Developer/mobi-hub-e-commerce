export const errorMiddleware = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {}).map((item) => item.message).join(". ") || "Validation failed";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path || "value"}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = field === "slug" ? "A record with this slug already exists" : "A record with this value already exists";
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Image size must not exceed 5 MB";
  }

  // Multer maximum files error
  if (err.code === "LIMIT_FILE_COUNT") {
    statusCode = 400;
    message = "Maximum 7 images are allowed";
  }

  // Multer unexpected field error
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected image upload field";
  }

  // Unsupported image format
  if (err.message === "Only JPG, PNG and WEBP images are allowed") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal Server Error" : message,
  });
};
