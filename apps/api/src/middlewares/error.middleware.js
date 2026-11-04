
export const errorMiddleware = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal Server Error"
        : err.message || "Something went wrong",
  });
};
