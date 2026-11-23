import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only MP4, WEBM and MOV videos are allowed"), false);
  }

  cb(null, true);
};

const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
    files: 1,
  },
});

export default videoUpload;
