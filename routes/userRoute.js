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
} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router
  .route("/me")
  .get(isAuthenticatedUser, getUser)
  .put(isAuthenticatedUser, updateProfile);
router
  .route("/email/verify")
  .put(isAuthenticatedUser, verifyEmail)
  .get(resendOtp);
router.route("/logout").post(isAuthenticatedUser, logoutUser);
module.exports = router;
