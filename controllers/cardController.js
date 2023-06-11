const User = require("../models/userModel");
const Card = require("../models/cardModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.createCard = catchAsyncErrors(async (req, res, next) => {
  const { cardNumber, cardType, expiryDate } = req.body;

  if (!cardNumber || !cardType || !expiryDate) {
    return next(new ErrorHandler("Required Parameters not provided", 422));
  }

  const findCard = await Card.findOne({ cardNumber: cardNumber });

  if (findCard) {
    return next(
      new ErrorHandler("Card already exist or Been used by another user", 409)
    );
  }

  const card = await Card.create({
    cardNumber: cardNumber,
    cardType: cardType,
    expiryDate: expiryDate,
    user: req.user._id,
  });

  res
    .status(201)
    .json({ success: true, message: "Card Created Successfully", card });
});

exports.getAllUserCard = catchAsyncErrors(async (req, res, next) => {
  const card = await Card.find({ user: req.user._id });

  res.status(200).json({ success: true, card });
});

exports.deleteOneUserCard = catchAsyncErrors(async (req, res, next) => {
  const { cardId } = req.params;

  if (!cardId) {
    return next(new ErrorHandler("Card Id not provided", 422));
  }

  const card = await Card.findById(cardId);

  if (card.user !== req.user._id) {
    return next(new ErrorHandler("Unauthorized to delete this card", 403));
  }

  card.deleteOne();

  res.status(200).json({ success: true, message: "Card successfully deleted" });
});

exports.getACard = catchAsyncErrors(async (req, res, next) => {
  const { cardId } = req.params;

  if (!cardId) {
    return next(new ErrorHandler("Card Id not provided", 422));
  }

  const card = await Card.findById(cardId);

  if (!card || card.user !== req.user._id) {
    return next(new ErrorHandler("Card not Found", 404));
  }

  res.status(200).json({ success: true, card });
});
