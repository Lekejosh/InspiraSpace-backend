const express = require("express");
const router = express.Router();

const {
  getTopTrendingArts,
  discoverArt,
  artBasedOnUserIntrest,
  userArtFeed,
} = require("../controllers/artController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/trending").get(isAuthenticatedUser, getTopTrendingArts);
router.route("/discover").get(isAuthenticatedUser, discoverArt);
router.route("/intrests").get(isAuthenticatedUser, artBasedOnUserIntrest);
router.route("/").get(isAuthenticatedUser, userArtFeed);
module.exports = router;
