import * as adminUserService from "../services/admin-user.service.js";

// Get all customers
export const getAdminUsers = async (req, res, next) => {
  try {
    const filters = req.validatedData.query;

    const result = await adminUserService.getAdminUsers(filters);

    return res.status(200).json({
      success: true,
      results: result.users.length,
      pagination: result.pagination,
      data: result.users,
    });
  } catch (error) {
    next(error);
  }
};

// Get single customer
export const getAdminUserById = async (req, res, next) => {
  try {
    const user = await adminUserService.getAdminUserById(
      req.validatedData.params.userId,
    );

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Activate / Deactivate customer
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.validatedData.params;
    const { isActive } = req.validatedData.body;

    const user = await adminUserService.updateUserStatus(
      userId,
      isActive,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
