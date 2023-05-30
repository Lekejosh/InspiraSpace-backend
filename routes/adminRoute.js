const express = require("express");
const router = express.Router();

const {
  getUser,
  getAllUsers,
  editUserRole,
  deleteUser,
  activateOrDeactivateUser,
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
router
  .route("/user/delete/:userId")
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser);
router
  .route("/user/deactivate/:userId")
  .put(isAuthenticatedUser, authorizeRole("admin"), activateOrDeactivateUser);

module.exports = router;
