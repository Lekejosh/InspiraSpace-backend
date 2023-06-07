const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.accessChat = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.query;
  if (!userId) {
    return next(new ErrorHandler("User Id not specified", 422));
  }
  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      var newMessage = {
        sender: req.user._id,
        content: {
          message: `Chat is Encrypted`,
          type: "Group Activity",
        },
        chat: createdChat._id,
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
        await Chat.findByIdAndUpdate(createdChat._id, {
          latestMessage: message,
        });

        res.status(200).json({ success: true, message });
      } catch (error) {}
    } catch (error) {}
  }
});

exports.fetchChats = catchAsyncErrors(async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "displayName avatar email username",
        });

        // Filter out the encrypted chats
        results = results.filter((result) => {
          return result.latestMessage.content.message !== "Chat is Encrypted";
        });

        res.status(200).json({ success: true, data: results });
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
