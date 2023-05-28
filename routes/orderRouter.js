const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/orderController");
const { isAuthenticatedUser, deactivated } = require("../middlewares/auth");

router.route("/create").post(isAuthenticatedUser, deactivated, createOrder);

module.exports = router;
