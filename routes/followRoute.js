const express = require("express");
const router = express.Router();

const {
  followUser,
  unfollowUser,
  blockUser,
  unBlockUser,
  subscribeToUserOrUnsubscribe,
} = require("../controllers/followController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router
  .route("/:userId")
  .put(isAuthenticatedUser, followUser)
  .delete(isAuthenticatedUser, unfollowUser);

router
  .route("/block/:userId")
  .put(isAuthenticatedUser, blockUser)
  .delete(isAuthenticatedUser, unBlockUser);
router
  .route("/subscribe/:userId")
  .get(isAuthenticatedUser, subscribeToUserOrUnsubscribe);

module.exports = router;
