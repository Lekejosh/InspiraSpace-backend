const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { content, chatId } = req.body;
  if (!content) {
    return console.log("No Content Provided");
  }

  if (!chatId) return next(new ErrorHandler("Chat Id not provided", 401));

  var newMessage = {
    sender: req.user._id,
    content: {
      message: content,
      type: "Message",
    },
    chat: chatId,
    isReadBy: [req.user._id],
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json(message);
  } catch (error) {
    return next(new ErrorHandler("Invalid Chat Id", 400));
  }
});

exports.allMessages = catchAsyncErrors(async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.query.chatId })
      .populate("sender", "username avatar email")
      .populate("chat");

    const chat = await Chat.findById(req.query.chatId).populate(
      "users",
      "username avatar"
    );
    const data = { messages, chat };
    res.status(200).json({ success: true, data });
  } catch (error) {
    return next(new ErrorHandler("Invalid request", 400));
  }
});

exports.isReadMessage = catchAsyncErrors(async (req, res, next) => {
  const { messageId } = req.query;

  if (!messageId) return next(new ErrorHandler("Message Id not provided", 401));

  const message = await Message.findById(messageId);

  if (!message) return next(new ErrorHandler("Message not found", 404));

  const ifExist = message.isReadBy.includes(
   req.user._id
  );

  if (ifExist) {
    return next(new ErrorHandler("You've already Read this message", 400));
  }

  message.isReadBy.push(req.user._id);
  await message.save();

  res.status(200).json({ success: true, message });
});