const express = require("express");
const router = express.Router();

const { accessChat, fetchChats } = require("../controllers/chatController");
const { isAuthenticatedUser, deactivated } = require("../middlewares/auth");

router.route('/access').get(isAuthenticatedUser,deactivated,accessChat)
router.route('/').get(isAuthenticatedUser,deactivated,fetchChats)

module.exports = router;
