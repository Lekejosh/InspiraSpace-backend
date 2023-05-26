const User = require("../models/userModel");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { generateOTP } = require("../utils/otpGenerator");
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
    generatedOtp: generateOTP(),
    generatedOtpExpire: Date.now() + 15 * 60 * 1000,
    avatar: {
      public_id: "test",
      url: "www.example.code",
    },
  });

  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} (This is only availbale for 15 Minutes!)\n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} <${user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    user.generatedOtp = undefined;
    user.generatedOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }

  user.getAccessToken();

  sendToken(user, 201, res);
});

exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { otp } = req.body;
  const now = Date.now();
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (user.isVerified) {
    return next(new ErrorHandler("Account Already Verified", 400));
  }
  if (otp !== user.generatedOtp || user.generatedOtpExpire <= now) {
    return next(new ErrorHandler("Otp is invalid or Expired", 400));
  }

  user.isVerified = true;
  user.generatedOtp = undefined;
  user.generatedOtpExpire = undefined;
  await user.save();

  await sendEmail({
    email: `${user.firstName} <${user.email}>`,
    subject: "Account Verified",
    html: "Account Verified Successfully",
  });

  res
    .status(200)
    .json({ success: true, message: "Email Verified Successfully" });
});

exports.resendOtp = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User Not found", 404));
  }
  if (user.isVerified) {
    return next(new ErrorHandler("Email Address already Verified", 400));
  }
  user.generatedOtp = generateOTP();
  user.generatedOtpExpire = Date.now() + 15 * 60 * 1000;
  await user.save();
  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} (This is only availbale for 15 Minutes!)\n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.firstName} <${user.email}>`,
      subject: "Veritfy Account",
      html: data,
    }).then(() => {
      console.log("Email Sent Successfully");
    });
  } catch (err) {
    user.generatedOtp = undefined;
    user.generatedOtpExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
  res.status(200).json({ success: true, message: "Otp sent" });
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
  const user = await User.findById(req.user._id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({ user });
});

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  const cookie = req.cookies.cookie;
  if (!cookie) return next(new ErrorHandler("cookie not present", 400));
  const user = await User.findById(req.user._id);
  res.clearCookie("cookie", {
    httpOnly: true,
    // secure: true,
    // sameSite: "None",
  });
  if (!user)
    return next(new ErrorHandler("User not found or already logged out", 404));

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { bio, location, mobileNumber } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (bio) {
    user.bio = bio;
  }

  if (location) {
    user.location = location;
  }

  if (mobileNumber) {
    user.mobileNumber = mobileNumber;
  }

  await user.save();

  res.status(200).json({ success: true, user });
});
