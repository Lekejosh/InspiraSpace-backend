const express = require("express");
const router = express.Router();

const {
  createCard,
  getAllUserCard,
  deleteOneUserCard,
  getACard,
} = require("../controllers/cardController");
const { isAuthenticatedUser, deactivated } = require("../middlewares/auth");

router
  .route("/")
  .post(isAuthenticatedUser, deactivated, createCard)
  .get(isAuthenticatedUser, deactivated, getAllUserCard);

router
  .route("/:cardId")
  .get(isAuthenticatedUser, deactivated, getACard)
  .delete(isAuthenticatedUser, deactivated, deleteOneUserCard);
module.exports = router;
