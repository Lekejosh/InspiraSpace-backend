const express = require("express");
const router = express.Router();

const {
  createOrder,
  payForOrder,
  getOrder,
  getAllOrder,
} = require("../controllers/orderController");
const { isAuthenticatedUser, deactivated } = require("../middlewares/auth");

router.route("/create").post(isAuthenticatedUser, deactivated, createOrder);
router
  .route("/pay/:orderId")
  .put(isAuthenticatedUser, deactivated, payForOrder);
router
  .route("/single/:orderId")
  .get(isAuthenticatedUser, deactivated, getOrder);
router.route("/all").get(isAuthenticatedUser, deactivated, getAllOrder);

module.exports = router;
