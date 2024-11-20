// token.js
const jwt = require("jsonwebtoken");

// Create JWT token and save as a cookie
exports.sendToken = (user, statusCode, res) => {
    
  if (!user || !user.user_id) {
    throw new Error('User ID is required to generate JWT');
  }

  const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      data: user,
    });
};