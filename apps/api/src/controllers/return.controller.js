import {
  requestReturn,
  getAdminReturns,
  reviewReturnRequest,
  markReturnProductReceived,
  inspectReturnProduct,
  restoreReturnStock,
  processReturnRefund,
} from "../services/return.service.js";

export const createReturnRequest = async (req, res, next) => {
  try {
    const newReturn = await requestReturn(req.user._id, req.body);

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      data: {
        return: newReturn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReturnsList = async (req, res, next) => {
  try {
    const result = await getAdminReturns(req.query);

    return res.status(200).json({
      success: true,
      message: "Return requests fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewReturnRequestController = async (req, res, next) => {
  try {
    const updatedReturn = await reviewReturnRequest(
      req.params.id,
      req.user._id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: `Return request ${updatedReturn.status.toLowerCase()} successfully`,
      data: {
        return: updatedReturn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markReturnProductReceivedController = async (req, res, next) => {
  try {
    const updatedReturn = await markReturnProductReceived(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Return product marked as received successfully",
      data: {
        return: updatedReturn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const inspectReturnProductController = async (req, res, next) => {
  try {
    const updatedReturn = await inspectReturnProduct(
      req.params.id,
      req.user._id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: `Return product inspection ${updatedReturn.status === "InspectionPassed" ? "passed" : "failed"} successfully`,
      data: {
        return: updatedReturn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const restoreReturnStockController = async (req, res, next) => {
  try {
    const updatedReturn = await restoreReturnStock(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Return product stock restored successfully",
      data: {
        return: updatedReturn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const processReturnRefundController = async (req, res, next) => {
  try {
    const updatedReturn = await processReturnRefund(
      req.params.id,
      req.user._id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Return refund processing initiated successfully",
      data: {
        return: updatedReturn,
      },
    });
  } catch (error) {
    next(error);
  }
};
