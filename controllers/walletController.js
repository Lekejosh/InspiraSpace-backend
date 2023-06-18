const Wallet = require('../models/walletModel')
const Card = require('../models/cardModel')
const User = require('../models/userModel')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')


exports.pay = catchAsyncErrors(async(req,res,next)=>{
    
})