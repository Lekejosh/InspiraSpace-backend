const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getUser } = require("../controllers/userController");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/user/:id").get(getUser)

module.exports = router;
