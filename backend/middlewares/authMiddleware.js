const catchAsyncErrors = require("./catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");

exports.checkUserAuthentication = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler("Please login again to access this resource", 401)
    );
  }

  try {
    const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

    const {
      data: [user],
      error,
    } = await supabase.rpc("get_user_by_id", { _user_id: decodedData.id });

    if (error || !user) {
      return next(new ErrorHandler("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired. Please login again.", 403));
    }

    return next(new ErrorHandler("Invalid token. Please login again.", 401));
  }
});

exports.checkAdminPrivileges = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.user_role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ErrorHandler(
          `Role: ${userRole} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};
