const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Post = require("../models/postModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { OrderedBulkOperation } = require("mongodb");

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
    user: req.user._id,
  });

  res
    .status(201)
    .json({ success: true, message: "Order Created Successfully", order });
});

exports.payForOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const { payment } = req.body;

  if (!orderId || !payment)
    return next(new ErrorHandler("All Parmaters is not provided", 422));

  const order = await Order.findById(orderId);

  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.user != req.user._id)
    return next(new ErrorHandler("You didn't make this order", 401));

  order.payment = payment;
  await order.save();

  res
    .status(200)
    .json({ success: true, message: "order for successfully", order });
});

exports.getOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) return next(new ErrorHandler("Order Id not provided", 422));

  const order = await Order.findById(orderId);

  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.user != req.user._id)
    return next(new ErrorHandler("You didn't make this order", 401));

  res.status(200).json({ success: true, order });
});

exports.getAllOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order.length) return next(new ErrorHandler("No Order not found", 404));

  res.status(200).json({ success: true, order });
});

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) return next(new ErrorHandler("Order Id not provided", 422));

  const order = await Order.findById(orderId);

  if (!order) return next(new ErrorHandler("Order not found", 404));

  if (order.user != req.user._id)
    return next(new ErrorHandler("You didn't create this order"));

    if(Order.payment.status == 'paid') {
      return next(new ErrorHandler("You can't delete an already paid order"))
    }

  Order.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Order Deleted Successfully" });
});
