
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1. Check authentication
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // 2. Check user role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this resource",
        });
      }

      // 3. Allow access
      next();
    } catch (error) {
      console.error("RBAC Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};
