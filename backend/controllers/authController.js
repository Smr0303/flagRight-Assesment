const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const catchAsyncError = require("../middlewares/catchAsyncError");
const { supabase } = require('../config/db'); // Import the Supabase client
const ErrorHandler = require('../utils/errorHandler');
const { sendToken } = require('../utils/token'); // Import the sendToken function

exports.registerUser = catchAsyncError(async (req, res, next) => {

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || typeof role !== 'number') {

    return next(new ErrorHandler('Missing or invalid fields', 400));
  }

  const userId = uuidv4(); // Generate a UUID for the user

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Call the PostgreSQL function to insert the user

  const user = {
    _id: userId,
    _name: name,
    _email: email,
    _password: hashedPassword,
    _role: role
  };


  const { data, error } = await supabase.rpc('insert_user', user);

  if (error) return next(new ErrorHandler(error.message, 500));

  console.log("here");

  res.status(200).json({
    success: true,
    data:user
  });
});



exports.loginUser = catchAsyncError(async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password)  return next(new ErrorHandler('Please enter email and password', 400));
  

  // Fetch the user from the database
  const { data: user, error } = await supabase.rpc('get_user', { _email: email });

  const userData = user[0];

  if (error || !userData) return next(new ErrorHandler('Invalid email or password', 401));
  
  // Check if the password matches

  const isPasswordMatched = await bcrypt.compare(password, userData.user_password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Send the token
  sendToken(userData, 200, res);
});