const User = require("../models/userModel");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { v4: uuidv4 } = require("uuid");
// const { generateOTP } = require("../utils/otpGenerator");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, password, mobileNumber } = req.body;

  const existingUser = await User.findOne({ email: email });

  if (existingUser)
    return next(new ErrorHandler("Email already existing, Please Login", 409));

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
    avatar: {
      public_id: "test",
      url: "www.example.code",
    },
  });

  user.getAccessToken();

  sendToken(user, 201, res);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { emailNumb, password } = req.body;

  if (!emailNumb || !password)
    return next(
      new ErrorHandler(
        "Please enter your Email/Mobile Number and Password",
        400
      )
    );

  const user = await User.findOne({
    $or: [{ email: emailNumb }, { mobileNumber: emailNumb }],
  }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Credentials", 401));

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid Credentials", 401));

  user.getAccessToken();
  sendToken(user, 200, res);
});

exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  res.status(200).json({ user });
});
