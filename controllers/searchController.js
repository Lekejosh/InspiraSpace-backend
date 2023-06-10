const Post = require("../models/postModel");
const User = require("../models/userModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
exports.search = catchAsyncErrors(async (req, res, next) => {
const { q } = req.query;
console.log(q)

try {
  const users = await User.find({ username: q });
  const posts = await Post.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { hashtags: { $regex: q, $options: "i" } },
      { type: { $regex: q, $options: "i" } },
    ],
  });


  res.json({ users, posts });
} catch (error) {
  console.error("Error during search", error);
  res.status(500).json({ error: "Internal server error" });
}
});
