const express = require("express");
const router = express.Router();

const upload = require("../utils/multer");
const {
  createPost,
  editPost,
  deletePost,
  likePost,
  unlikePost,
  createPostReview,
  getPostReviews,
  deletePostReview,
  getPost,
} = require("../controllers/postController");

const { isAuthenticatedUser } = require("../middlewares/auth");

router
  .route("/")
  .post(isAuthenticatedUser, upload.array("images", 5), createPost);
router.route("/:postId").get(isAuthenticatedUser, getPost);
router
  .route("/edit/:postId")
  .put(isAuthenticatedUser, editPost)
  .delete(isAuthenticatedUser, deletePost);
router
  .route("/like/:postId")
  .put(isAuthenticatedUser, likePost)
  .delete(isAuthenticatedUser, unlikePost);

router
  .route("/review/:postId")
  .put(isAuthenticatedUser, createPostReview)
  .get((isAuthenticatedUser, getPostReviews))
  .delete(isAuthenticatedUser, deletePostReview);

module.exports = router;
