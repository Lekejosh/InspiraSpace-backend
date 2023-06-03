const User = require("../models/userModel");
const Post = require("../models/postModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.getTopTrendingArts = catchAsyncErrors(async (req, res, next) => {
  const allArts = await Post.find();

  const trendingArt = [];

  const filteredByRating = allArts.filter(
    (art) => art.ratings >= 4 && art.ratings <= 5
  );
  const filteredByCreationAndRating = allArts.filter((art) => {
    const currentDate = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(currentDate.getDate() - 3);
    return (
      art.createdAt >= threeDaysAgo &&
      art.createdAt <= currentDate &&
      art.ratings >= 4 &&
      art.ratings <= 5
    );
  });
  const sortedByLikes = allArts
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 5);

  trendingArt.push(
    ...filteredByRating,
    ...filteredByCreationAndRating,
    ...sortedByLikes
  );

  const sortedTrendingArt = shuffleArray(trendingArt);

  res.status(200).json({
    success: true,
    data: sortedTrendingArt,
  });
});

function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
exports.discoverArt = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const following = user.following;

  const arts = await Post.find({ author: { $nin: following } });

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const shuffledArts = shuffleArray(arts);

  res.status(200).json({
    success: true,
    data: shuffledArts,
  });
});

exports.artBasedOnUserIntrest = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const userInterests = user.intrests;

  const arts = await Post.find({
    type: { $in: userInterests },
    author: { $ne: req.user.id },
  });

  res.status(200).json({
    success: true,
    data: arts,
  });
});
