const express = require("express");
const router = express.Router();

const { isAuthenticatedUser, deactivated } = require('../middlewares/auth')
const { search } = require("../controllers/searchController");

router.route("/").get(isAuthenticatedUser,deactivated,search);

module.exports = router;
