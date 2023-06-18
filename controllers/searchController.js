const Post = require("../models/postModel");
const User = require("../models/userModel");
const History = require("../models/historyModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

//TODO: Add Hashtag to search

exports.search = catchAsyncErrors(async (req, res, next) => {
  const string = req.query.q;
  const regexed = new RegExp(string, "i");
  if (!string) {
    return res.status(400).json({ error: "No search keyword provided" });
  }

  try {
    const users = await User.find();
    let userToReturn = users.filter((user) => regexed.test(`${user.username}`));

    const posts = await Post.find().populate("author");
    let postToReturn = posts.filter((post) =>
      regexed.test(
        `${post.title} ${post.location} ${post.type} ${post.description}`
      )
    );

    userToReturn = userToReturn.map((user) => {
      return {
        displayName: user.displayName,
        username: user.username,
        avatar: user.avatar,
      };
    });

    History.create({
      user: req.user._id,
      details: string,
      type: "search",
    });

    res.status(200).json({
      users: userToReturn,
      post: postToReturn,
    });
  } catch (error) {
    console.error(error);
  }
});
