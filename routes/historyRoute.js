const express = require('express')

const router = express.Router()

const { deleteHistory, getAllHistoryByType } = require('../controllers/historyController')

const { isAuthenticatedUser, deactivated } = require('../middlewares/auth')

router.route('/:historyId').delete(isAuthenticatedUser,deactivated,deleteHistory)
router
  .route("/")
  .get(isAuthenticatedUser, deactivated, getAllHistoryByType);

module.exports = router