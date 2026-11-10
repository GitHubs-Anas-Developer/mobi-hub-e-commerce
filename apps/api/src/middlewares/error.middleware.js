export const errorMiddleware = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

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
