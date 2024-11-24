const jwt = require("jsonwebtoken");

// Create JWT token and save as a cookie
exports.sendToken = (user, statusCode, res) => {
  if (!user || !user.user_id) {
    throw new Error("User ID is required to generate JWT");
  }

  const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  // const options = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  // };

  const options = {
    httpOnly: true,                // Prevents client-side access to the cookie
    secure: true,                 // Cookie only sent over HTTPS
    sameSite: 'none',            // Required for cross-origin cookies
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'                    // Cookie is valid for all paths
  };  

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
  });
};
