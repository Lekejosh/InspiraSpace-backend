const express = require('express')
const router = express.Router()

const { sendMessage, allMessages, isReadMessage } = require('../controllers/messageController')
const { isAuthenticatedUser, deactivated } = require('../middlewares/auth')

router.route('/').post(isAuthenticatedUser,deactivated, sendMessage).get(isAuthenticatedUser,deactivated,allMessages).put(isAuthenticatedUser,deactivated,isReadMessage)

module.exports = router