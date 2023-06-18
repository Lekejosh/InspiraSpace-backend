const Wallet = require("../models/walletModel");
const History = require("../models/historyModel");
const Card = require("../models/cardModel");
const User = require("../models/userModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.deposit = catchAsyncErrors(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next(new ErrorHandler("Required Parameters not provided", 422));
  }

  const wallet = await Wallet.findOne({ user: req.user._id });

  if (!wallet) {
    return next(new ErrorHandler("Wallet not found", 404));
  }

  wallet.amount = wallet.amount + amount;
  await wallet.save();

  await History.create({
    user: req.user._id,
    details: `${amount} ${wallet.currency} Deposited`,
    status: "success",
    type: "transaction",
  });

  res.status(200).json({
    success: true,
    wallet,
  });
});

exports.createWallet = catchAsyncErrors(async (req, res, next) => {
  const { currency } = req.body;
  const wallet = await Wallet.findOne({ user: req.user._id });

  if (wallet) {
    return next(new ErrorHandler("This user already has a wallet", 403));
  }

  const newWallet = await Wallet.create({
    user: req.user._id,
    amount: 0,
    currency: currency,
  });

  res.status(201).json({ success: true, wallet: newWallet });
});
