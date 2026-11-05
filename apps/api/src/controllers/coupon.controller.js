import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  applyCoupon,
} from "../services/coupon.service.js";

export const addCoupon = async (req, res, next) => {
  try {
    const coupon = await createCoupon(req.validatedData.body);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllCoupons = async (req, res, next) => {
  try {
    const result = await getAllCoupons(req.validatedData.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get coupon by ID (Admin)
export const fetchCouponById = async (req, res, next) => {
  try {
    const coupon = await getCouponById(req.validatedData.params.couponId);

    res.status(200).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// Update coupon (Admin)
export const editCoupon = async (req, res, next) => {
  try {
    const coupon = await updateCoupon(
      req.validatedData.params.couponId,
      req.validatedData.body,
    );

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// Delete coupon (Admin)
export const removeCoupon = async (req, res, next) => {
  try {
    const result = await deleteCoupon(req.validatedData.params.couponId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle coupon status (Admin)
export const changeCouponStatus = async (req, res, next) => {
  try {
    const coupon = await toggleCouponStatus(
      req.validatedData.params.couponId,
      req.validatedData.body.isActive,
    );

    res.status(200).json({
      success: true,
      message: "Coupon status updated successfully",
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// Apply Coupon (Customer)
export const applyCouponCode = async (req, res, next) => {
  try {
    const result = await applyCoupon(req.user._id, req.validatedData.body.code);

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
