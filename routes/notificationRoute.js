const express = require("express");
const router = express.Router();

const {
  getNotification,
  readNotification,
  getAllUserNotifications,
} = require("../controllers/notificationsController");

const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/").get(isAuthenticatedUser, getNotification);
router.route("/all").get(isAuthenticatedUser, getAllUserNotifications);
router
  .route("/read/:notificationId")
  .put(isAuthenticatedUser, readNotification);

module.exports = router;
