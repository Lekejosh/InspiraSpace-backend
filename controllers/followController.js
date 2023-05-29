const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

exports.followUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) return next(new ErrorHandler("User id not specified", 422));

  if (userId === req.user._id)
    return next(
      new ErrorHandler(
        "LOL, you must be very funny, you want to follow yourself🤡",
        401
      )
    );

  const userToFollow = await User.findById(userId);

  if (!userToFollow) return next(new ErrorHandler("User Not found", 404));

  const user = await User.findById(req.user._id);

  const checkIfFollowingUserIsNotBlock = userToFollow.blocked.find(
    (user) => user == req.user._id
  );
  if (checkIfFollowingUserIsNotBlock)
    return next(new ErrorHandler("This user has already blocked you😔", 401));

  const checkIfRequestingFollowUserHasBlockedTheOtherUser =
    user.blocked.includes(userId);

  if (checkIfRequestingFollowUserHasBlockedTheOtherUser)
    return next(new ErrorHandler("You've blocked this user", 400));

  const alreadyFollow = userToFollow.followers.find(
    (user) => user == req.user._id
  );

  if (alreadyFollow) {
    return next(new ErrorHandler("You already follow this user", 400));
  }

  userToFollow.followers.push(req.user._id);
  await userToFollow.save();

  user.following.push(userId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "User followed successfully",
    user,
  });
});

exports.unfollowUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) return next(new ErrorHandler("User id not specified", 422));

  if (userId === req.user._id)
    return next(
      new ErrorHandler(
        "LOL, you must be very funny, you want to unfollow yourself🤡",
        401
      )
    );

  const userToFollow = await User.findById(userId);

  if (!userToFollow) return next(new ErrorHandler("User Not found", 404));

  const alreadyFollow = userToFollow.followers.find(
    (user) => user == req.user._id
  );

  if (!alreadyFollow) {
    return next(new ErrorHandler("You not following this user", 400));
  }

  userToFollow.followers = userToFollow.followers.filter(
    (user) => user !== req.user._id
  );
  await userToFollow.save();

  const user = await User.findById(req.user._id);

  user.following = user.following.filter((user) => user !== userId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "User unfollowed successfully",
    user,
  });
});

exports.getAllFollowingAndFollwers = catchAsyncErrors(
  async (req, res, next) => {
    const user = await User.findById(req.user._id).populate(
      "following followers",
      "displayName username"
    );

    res.status(200).json({ success: true, user });
  }
);

exports.blockUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) return next(new ErrorHandler("User Id not specified", 422));

  const userToBeBlocked = await User.findById(userId);

  if (!userToBeBlocked) return next(new ErrorHandler("User not found", 404));

  if (userId === req.user._id)
    return next(
      new ErrorHandler(
        "Amazing!!! So you want to block yourself from yourself😂😂😂",
        403
      )
    );

  const user = await User.findById(req.user._id).populate();

  const checkIfUserIsAlreadyBlocked = user.blocked.includes(userId);

  if (checkIfUserIsAlreadyBlocked)
    return next(
      new ErrorHandler(
        "You really hate this user, cause you've already blocked him",
        400
      )
    );

  user.following = user.following.filter((user) => user != userId);
  user.followers = user.followers.filter((user) => user != userId);
  user.blocked.push(userId);
  await user.save();

  userToBeBlocked.followers = userToBeBlocked.followers.filter(
    (user) => user != req.user._id
  );
  userToBeBlocked.following = userToBeBlocked.following.filter(
    (user) => user != req.user._id
  );
  await userToBeBlocked.save();

  res
    .status(200)
    .json({ success: true, message: "User Blocked Successfully", user });
});

exports.unBlockUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) return next(new ErrorHandler("User Id not specified", 422));

  const userToBeUnblocked = await User.findById(userId);

  if (!userToBeUnblocked) return next(new ErrorHandler("User Not Found", 404));

  const user = await User.findById(req.user._id);

  user.blocked = user.blocked.filter((user) => user != userId);
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "User Unblocked successfully", user });
});

exports.subscribeToUserOrUnsubscribe = catchAsyncErrors(
  async (req, res, next) => {
    const { userId } = req.params;
    const { subscribe } = req.query;

    if (!userId || !subscribe) {
      return next(new ErrorHandler("Required Parametrs not provided", 422));
    }

    if (userId == req.user._id) {
      return next(
        new ErrorHandler(
          "Amazing!!! So you want to subscribe to yourself😂😂😂",
          403
        )
      );
    }
    const userToSubscribeOrUnsubscribeTo = await User.findById(userId);

    if (!userToSubscribeOrUnsubscribeTo) {
      return next(new ErroHandler("User not found", 404));
    }

    const subscribingUser = await User.findById(req.user._id);

    const alreadyBlocked = userToSubscribeOrUnsubscribeTo.blocked.includes(
      req.user._id
    );

    if (alreadyBlocked) {
      return next(new ErrorHandler("This artist has already blocked you", 403));
    }

    if (subscribe == "true") {
      const alreadySubscribed =
        userToSubscribeOrUnsubscribeTo.subscribers.includes(req.user._id);
      if (alreadySubscribed) {
        return next(
          new ErrorHandler("you're already subscribe to this artist", 403)
        );
      }
      userToSubscribeOrUnsubscribeTo.subscribers.push(req.user._id);
      await userToSubscribeOrUnsubscribeTo.save();
      res.status(200).json({
        success: true,
        message: "You successfully subscribe to the artist",
      });
    } else if (subscribe == "false") {
      const notSubscribeToBefore =
        userToSubscribeOrUnsubscribeTo.subscribers.includes(req.user._id);
      if (!notSubscribeToBefore) {
        return next(
          new ErrorHandler(
            "You're not subscribed to this artist before, so it's impossible to unsubscribe",
            403
          )
        );
      }

      userToSubscribeOrUnsubscribeTo.subscribers =
        userToSubscribeOrUnsubscribeTo.subscribers.filter(
          (user) => user != req.user._id
        );
      await userToSubscribeOrUnsubscribeTo.save();
      res.status(200).json({
        success: true,
        message: "You successfully unsubscribe to the artist",
      });
    }
  }
);

exports.getBlockedUsers = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    "blocked",
    "displayName username"
  );

  if (!user.blocked.length) {
    return res
      .status(200)
      .json({ success: true, message: "You don't have any blocked user" });
  }

  res.status(200).json({ success: true, user: user.blocked });
});
