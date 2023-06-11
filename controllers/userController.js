const User = require("../models/userModel");
const Post = require("../models/postModel");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendMail");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { generateOTP } = require("../utils/otpGenerator");
const cloudinary = require("cloudinary");

const passport = require("passport");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const {
    displayName,
    username,
    email,
    password,
    mobileNumber,
    intrests,
    dob,
  } = req.body;

  const checkExistingUser = async (key, value) => {
    const existingUser = await User.findOne({ [key]: value });
    if (existingUser) {
      return `${key} ${value} is already taken.`;
    }
  };

  const errors = await Promise.all([
    checkExistingUser("email", email),
    checkExistingUser("username", username),
  ]);

  const error = errors.find((e) => e);
  if (error) {
    return next(new ErrorHandler(error, 409));
  }

  const user = await User.create({
    displayName,
    email,
    username,
    password,
    mobileNumber,
    dob,
    generatedOtp: generateOTP(),
    generatedOtpExpire: Date.now() + 15 * 60 * 1000,
    intrests,
    avatar: {
      public_id: "test",
      url: "www.example.code",
    },
  });

  //TODO: Remove the comment on Production

  try {
    const data = `Your email Verification Token is :-\n\n ${user.generatedOtp} (This is only availbale for 15 Minutes!)\n\nif you have not requested this email  then, please Ignore it`;
    await sendEmail({
      email: `${user.username} <${user.email}>`,
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

exports.googleAuth = passport.authenticate("google", {
  scope: ["email", "profile"],
});

exports.googleAuthSession = (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect("/api/v1/user/login");
    }

    try {
      const googleUser = await User.findOne({ email: user.email });

      if (googleUser) {
        googleUser.getAccessToken();
        sendToken(googleUser, 200, res);
      } else {
        const newUser = await User.create({
          email: user.email,
          displayName: user.displayName,
          username: user.given_name + user.id,
          isVerified: true,
          password: user.id,
        });

        newUser.getAccessToken();
        sendToken(newUser, 201, res);
      }
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { otp } = req.body;
  const now = Date.now();
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (user.isVerified) {
    return next(new ErrorHandler("Account Already Verified", 406));
  }
  if (otp !== user.generatedOtp || user.generatedOtpExpire <= now) {
    return next(new ErrorHandler("Otp is invalid or Expired", 400));
  }

  user.isVerified = true;
  user.generatedOtp = undefined;
  user.generatedOtpExpire = undefined;
  await user.save();

  await sendEmail({
    email: `${user.username} <${user.email}>`,
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
  const { emailNumbName, password } = req.body;

  if (!emailNumbName || !password)
    return next(
      new ErrorHandler(
        "Please enter your Email/Mobile Number/Username and Password",
        400
      )
    );

  const user = await User.findOne({
    $or: [
      { email: emailNumbName },
      { mobileNumber: emailNumbName },
      { username: emailNumbName },
    ],
  }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Credentials", 401));

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid Credentials", 401));

  user.getAccessToken();
  sendToken(user, 200, res);
});

exports.getMe = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  const post = await Post.find({ author: req.user._id }).sort("-createdAt");

  res.status(200).json({ success: true, user, post });
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

exports.updateIntrests = catchAsyncErrors(async (req, res, next) => {
  const { intrests } = req.body;

  if (intrests.length == 0) {
    return next(new ErrorHandler("Intrests not provided", 422));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.intrests = intrests;
  user.save();

  res.status(200).json({ success: true, message: "User Intrest updated" });
});

exports.changeUsername = catchAsyncErrors(async (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return next(new ErrorHandler("Username not provided", 422));
  }

  const existingUserName = await User.findOne({ username: username });

  if (existingUserName) {
    return next(new ErrorHandler("Username already exist", 401));
  }

  const user = await User.findById(req.user._id);

  user.username = username;

  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Username changed Successfully" });
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

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(oldPassword);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Current Password is wrong!!!", 400));

  if (newPassword !== confirmPassword)
    return next(
      new ErrorHandler("New Password and Confirm Password does not match", 400)
    );

  user.password = newPassword;
  user.save();

  res
    .status(200)
    .json({ success: true, message: "Password Update Successfully" });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { emailNumbName } = req.body;

  if (!emailNumbName)
    return next(
      new ErrorHandler("Please Provide Email/Mobile Number/Username", 400)
    );

  const user = await User.findOne({
    $or: [
      { email: emailNumbName },
      { mobileNumber: emailNumbName },
      { username: emailNumbName },
    ],
  });

  if (!user) {
    return next(new ErrorHandler("User Not found", 404));
  }

  if (user.isDeactivated) {
    return next(new ErrorHandler("Account Deactivated, Contact Support", 403));
  }

  const resetToken = user.getResetPasswordToken();
  user.save({ ValidateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset Token is :-\n\n ${resetPasswordUrl} \n\nif you have not requested this email then, please Ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: `User Password Recovery`,
      html: message,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
  res
    .status(200)
    .json({ success: true, message: "Reset Link Sent, Check your Mail!" });
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Reset Password Token is invalid", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not Match", 400));
  }
  const message = `Your password has been changed successfully`;
  await sendEmail({
    email: user.email,
    subject: `Password Changed Successfully`,
    html: message,
  });
  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password Changed Successfully" });
});

exports.updateAvatar = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.avatar) return next(new ErroHandler("Unexpected Field", 422));
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (user.avatar.public_id !== "default_image") {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  }

  const result = await cloudinary.v2.uploader.upload(req.file.path, {
    folder: "InspiraSpace",
    width: 150,
    crop: "scale",
  });

  user.avatar = {
    public_id: result.public_id,
    url: result.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "User Avatar Updated Successfully",
  });
});

exports.removeAvatar = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: "default_image",
    url: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar Deleted Successfully",
  });
});

exports.deactivateAccount = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.isDeactivated = true;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Account Deactivated successfully" });
});

exports.activateAccount = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.isDeactivatedBy == "admin") {
    return next(
      new ErrorHandler("You can't activate you account, contact support")
    );
  }
  user.isDeactivated = false;
  user.isDeactivatedBy = undefined;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Account is activated successfully" });
});

exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const { userIdOrUsername } = req.params;
  if (!userIdOrUsername) {
    return next(new ErrorHandler("User Id or Username is not provided", 422));
  }
  const user = await User.findOne({
    $or: [{ _id: userIdOrUsername }, { username: userIdOrUsername }],
  }).populate(
    "following followers blocked subscribers",
    "displayName username"
  );
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const post = await Post.find({ author: user._id }).sort("-createdAt");
  const postToSend = { user, post };

  res.status(200).json({ success: true, data: [postToSend] });
});

exports.searchUser = catchAsyncErrors(async (req, res, next) => {
  const mainUser = await User.findById(req.user._id);
  const blockedIds = mainUser.blocked.map((user) => user.toString());

  const users = await User.find({
    _id: { $nin: blockedIds, $ne: req.user._id },
    blocked: { $ne: req.user._id },
  });

  res.status(200).json({ success: true, users });
});
