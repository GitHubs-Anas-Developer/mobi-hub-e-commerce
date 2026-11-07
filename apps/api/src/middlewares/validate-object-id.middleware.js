import mongoose from "mongoose";

const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!mongoose.isValidObjectId(id)) {
      const error = new Error(`Invalid ${paramName}`);
      error.statusCode = 400;
      return next(error);
    }

    next();
  };
};

export default validateObjectId;
