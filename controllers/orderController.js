const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Post = require("../models/postModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { location, items, price, tax, totalAmount } = req.body;

  if (!location || !items || !price || !tax || !totalAmount) {
    return next(new ErrorHandler("All required Parameters not provided", 422));
  }

  const order = await Order.create({
    location,
    items,
    price,
    tax,
    totalAmount,
  });

  res
    .status(201)
    .json({ success: true, message: "Order Created Successfully", order });
});
