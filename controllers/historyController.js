const User = require("../models/userModel");
const History = require("../models/historyModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.deleteHistory = catchAsyncErrors(async (req, res, next) => {
  const { historyId } = req.params;

  if (!historyId) {
    return next(new ErrorHandler("History Id not provided", 422));
  }

  const history = await History.findById(historyId);

  if (!history || history.user !== req.user._id) {
    return next(new ErrorHandler("History not found", 404));
  }

  if (history.type !== "search") {
    return next(new ErrorHandler("Forbiidden", 403));
  }

  history.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "History deleted successfully" });
});

exports.getAllSearchHistory = catchAsyncErrors(async (req, res, next) => {
  const history = await History.find({ user: req.user._id, type: "search" });

  if (!history) {
    return next(new ErrorHandler("No search History found"));
  }

  const historyToReturn = history.map((history) => {
    return {
      details: history.details,
      _id: history._id,
    };
  });

  res.status(200).json({ success: true, history: historyToReturn });
});
