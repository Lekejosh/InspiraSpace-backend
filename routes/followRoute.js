const express = require("express");
const router = express.Router();

const {
  followUser,
  unfollowUser,
  blockUser,
  unBlockUser,
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

module.exports = router;
