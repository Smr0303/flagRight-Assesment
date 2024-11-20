const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");
const { checkUserAuthentication, checkAdminPrivileges } = require("../middlewares/authMiddleware");

// Define routes using router.route

router.route('/registerAdmin').post(registerUser);

router
  .route('/registerUser')
  .post(checkUserAuthentication,checkAdminPrivileges(5), registerUser); // Only allow roles 5 to register users

router
  .route('/login')
  .post(checkUserAuthentication,loginUser);

module.exports = router;