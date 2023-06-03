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
} = require("../controllers/postController");

const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").post(upload.single("avatar"),isAuthenticatedUser, createPost);
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
