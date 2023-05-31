const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Order = require("../models/orderModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.getNotification = catchAsyncErrors(async (req, res, next) => {
  const { notificationId } = req.query;

  if (!notificationId) {
    return next(new ErrorHandler("Notification Id not provided", 422));
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  if (notification.userId != req.user._id) {
    return next(
      new ErrorHandler("This notification is not meant for you", 403)
    );
  }

  notification.isRead = true;
  await notification.save();

  if (notification.type == "follow") {
    const user = await User.findById(notification.typeId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    return res.status(200).json({ success: true, user });
  } else if (
    notification.type == "art" ||
    notification.type == "like" ||
    notification.type == "comment"
  ) {
    const post = await Post.findById(notification.typeId);
    if (!post) {
      return next(new ErrorHandler("Post not found", 404));
    }
    return res.status(200).json({ success: true, post });
  } else if (notification.type == "order") {
    const order = await Order.findById(notification.typeId);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }
    return res.status(200).json({ success: true, order });
  }
});

exports.readNotification = catchAsyncErrors(async (req, res, next) => {
  const { notificationId } = req.params;
  if (!notificationId) {
    return next(new ErrorHandler("Notification Id not provided", 422));
  }

  const notification = await Notification.findById(notificationId);

  if (notification.userId != req.user._id) {
    return next(
      new ErrorHandler("This notification is not meant for you", 403)
    );
  }
  if (!notification) {
    return next(new ErrorHandler("Notification not found"));
  }

  notification.isRead = true;
  await notification.save();

  res
    .status(200)
    .json({ success: true, message: "Notifications Read successfully" });
});

exports.getAllUserNotifications = catchAsyncErrors(async (req, res, next) => {
  const notification = await Notification.find({ userId: req.user._id });
  if (notification.length == 0) {
    return res
      .status(200)
      .json({ success: true, message: "You have no notification" });
  }
  res.status(200).json({ success: true, notification });
});
