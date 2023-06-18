const express = require('express')
const router = express.Router()

const { isAuthenticatedUser, deactivated } = require('../middlewares/auth')
const { deposit, createWallet } = require('../controllers/walletController')

router.route('/').post(isAuthenticatedUser,deactivated,createWallet)
router.route('/deposit').put(isAuthenticatedUser,deactivated,deposit)

module.exports = router