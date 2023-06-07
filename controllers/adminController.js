const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Post = require("../models/postModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

//User

exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.query;
  if (!userId) {
    return next(new ErrorHandler("User Id is not provided", 422));
  }
  const user = await User.findById(userId).populate(
    "following followers blocked subscribers",
    "displayName username"
  );
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const post = await Post.find({ author: userId }).sort("-createdAt");

  const postToSend = { user, post };

  res.status(200).json({ success: true, data: [postToSend] });
});

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  if (!users || !users.length) {
    return res
      .status(200)
      .json({ success: true, message: "No User available" });
  }
  res.status(200).json({ success: true, users });
});
exports.editUserRole = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!userId || !role) {
    return next(new ErrorHandler("Parameters not specified", 422));
  }
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.role = role;
  user.save();
  res
    .status(200)
    .json({ success: true, message: "User Role updated successfully" });
});
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("User Id not provided", 422));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.deleteOne();

  res.status(200).json({ success: true, message: "User Deleted successfully" });
});
exports.activateOrDeactivateUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const { deactivate } = req.query;
  if (!userId || !deactivate) {
    return next(new ErrorHandler("Parameters not provided", 422));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (deactivate == true) {
    user.isDeactivated = deactivate;
    user.isDeactivatedBy = "admin";
    user.save();
    return res
      .status(200)
      .json({ success: true, message: "User deactivated successfully" });
  } else if (deactivate == false) {
    user.isDeactivated = deactivate;
    user.isDeactivatedBy = undefined;
    user.save();
    return res
      .status(200)
      .json({ success: true, message: "User has been activated successfully" });
  }

  return next(new ErrorHandler("Unexpected Parameter", 422));
});
// exports.activateUser;
