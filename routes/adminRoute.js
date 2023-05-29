const express = require("express");
const router = express.Router();

const {
  getUser,
  getAllUsers,
  editUserRole,
} = require("../controllers/adminController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router
  .route("/user/get")
  .get(isAuthenticatedUser, authorizeRole("admin"), getUser);
router
  .route("/user/get/all")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllUsers);
router
  .route("/user/edit/:userId")
  .put(isAuthenticatedUser, authorizeRole("admin"), editUserRole);

module.exports = router;
