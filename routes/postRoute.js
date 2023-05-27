const express = require("express");
const router = express.Router();

const {
  createPost,
  editPost,
  deletePost,
  likePost,
  unlikePost,
} = require("../controllers/postController");

const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").post(isAuthenticatedUser, createPost);
router
  .route("/edit/:postId")
  .put(isAuthenticatedUser, editPost)
  .delete(isAuthenticatedUser, deletePost);
router
  .route("/like/:postId")
  .put(isAuthenticatedUser, likePost)
  .delete(isAuthenticatedUser, unlikePost);

module.exports = router;
