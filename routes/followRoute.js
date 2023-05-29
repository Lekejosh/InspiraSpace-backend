const express = require("express");
const router = express.Router();

const {
  followUser,
  unfollowUser,
  blockUser,
  unBlockUser,
  subscribeToUserOrUnsubscribe,
  getBlockedUsers,
  getAllFollowingAndFollwers,
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
router.route('/get/blocked').get(isAuthenticatedUser,getBlockedUsers)
router.route('/get/follow').get(isAuthenticatedUser,getAllFollowingAndFollwers)

module.exports = router;
