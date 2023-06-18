const express = require('express')

const router = express.Router()

const { deleteHistory, getAllSearchHistory } = require('../controllers/historyController')

const { isAuthenticatedUser, deactivated } = require('../middlewares/auth')

router.route('/:historyId').delete(isAuthenticatedUser,deactivated,deleteHistory)
router
  .route("/")
  .get(isAuthenticatedUser, deactivated, getAllSearchHistory);

module.exports = router