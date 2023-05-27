const Post = require("../models/postModel");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/errorHandler");

exports.createPost = catchAsyncErrors(async (req, res, next) => {
  const { body, images, isACollection, price } = req.body;

  if (!body && !images)
    return next(new ErrorHandler("The two Input fields can't be empty", 422));

  const post = await Post.create({
    body,
    isACollection,
    price,
    author: req.user._id,
  });
  await post.populate("author", "firstName lastName");
  res.status(201).json({ success: true, message: "Post created", post });
});

exports.editPost = catchAsyncErrors(async (req, res, next) => {
  const { body } = req.body;
  const { postId } = req.params;

  if (!postId) return next(new ErrorHandler("Post Id not specified", 422));

  const post = await Post.findById(postId);

  if (!post) return next(new ErrorHandler("Post not found", 404));

  if (post.author !== req.user._id)
    return next(
      new ErrorHandler("Unauthorized to edit someone else's Post", 401)
    );

  post.body = body;
  post.isEdited = true;
  await post.save();

  res
    .status(200)
    .json({ success: true, message: "Post Edited succesfuly", post });
});

exports.deletePost = catchAsyncErrors(async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) return next(new ErrorHandler("Post Id not specified", 422));

  const post = await Post.findById(postId);

  if (!post) return next(new ErrorHandler("Post not Found", 404));

  if (post.author !== req.user._id)
    return next(
      new ErrorHandler("Unauthorized to delete someone else's Post", 401)
    );

  post.deleteOne();

  res.status(200).json({
    success: true,
    message: "Post deleted succesfully",
  });
});

exports.likePost = catchAsyncErrors(async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) return next(new ErrorHandler("Post Id not specified", 422));

  const post = await Post.findById(postId);

  if (!post) return next(new ErrorHandler("Post not found", 404));

  post.likes.push(req.user._id);
  await post.save();

  res
    .status(200)
    .json({ success: true, message: "Post liked successfully", post });
});

exports.unlikePost = catchAsyncErrors(async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) return next(new ErrorHandler("Post Id not specified", 422));

  const post = await Post.findById(postId);

  if (!post) return next(new ErrorHandler("Post not found", 404));

  const exist = post.likes.find((user) => user.toString() === req.user._id);

  if (!exist)
    return next(new ErrorHandler("User has not liked this post before", 401));

  post.likes = post.likes.filter((user) => user.toString() !== req.user._id);

  await post.save();

  res
    .status(200)
    .json({ success: true, message: "Post Unliked successfully", post });
});
