const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUser,
  verifyEmail,
  resendOtp,
  logoutUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  updateAvatar,
  removeAvatar,
  deactivateAccount,
  activateAccount,
  searchUser,
  updateIntrests,
  googleAuth,
  googleAuthSession,
  changeUsername,
} = require("../controllers/userController");
const { isAuthenticatedUser, deactivated } = require("../middlewares/auth");

const upload = require("../utils/multer");

router.route("/register").post(registerUser);
router.route("/auth/google").get(googleAuth);
router.route("/sessions/google").get(googleAuthSession);
router.route("/login").post(loginUser);
router
  .route("/me")
  .get(isAuthenticatedUser, deactivated, getUser)
  .put(isAuthenticatedUser, deactivated, updateProfile);
router
  .route("/email/verify")
  .put(isAuthenticatedUser, deactivated, verifyEmail)
  .get(isAuthenticatedUser, deactivated, resendOtp);
router.route("/password/forgot").get(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router
  .route("/update/avatar")
  .put(upload.single("avatar"), isAuthenticatedUser, deactivated, updateAvatar)
  .delete(isAuthenticatedUser, deactivated, removeAvatar);
router
  .route("/update/intrest")
  .put(isAuthenticatedUser, deactivated, updateIntrests);
router
  .route("/update/username")
  .put(isAuthenticatedUser, deactivated, changeUsername);
router.route("/logout").post(isAuthenticatedUser, deactivated, logoutUser);
router
  .route("/account/deactivate")
  .get(isAuthenticatedUser, deactivated, deactivateAccount);
router.route("/account/activate").get(isAuthenticatedUser, activateAccount);
router.route("/search").get(isAuthenticatedUser, searchUser);
module.exports = router;
