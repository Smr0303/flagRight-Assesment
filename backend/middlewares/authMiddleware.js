const catchAsyncErrors = require('./catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');
const {supabase} = require("../config/db");

exports.checkUserAuthentication = catchAsyncErrors(async (req, res, next) => {

  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler('Please login again to access this resource', 401)
    );
  }

  const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

//   console.log(decodedData);

  const { data: [user], error } = await supabase.rpc('get_user_by_id', { _user_id: decodedData.id });

  if (!user) new ErrorHandler('User not found', 401);
  
  req.user = user;

  next();
});


exports.checkAdminPrivileges = (...allowedRoles) => {

  return (req, res, next) => {

    console.log(req);

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
