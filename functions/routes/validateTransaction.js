const express = require('express')
const router = express.Router()
const passport = require('passport')
const BankAccountModel = require('../models/BankAccountModel')
const ValidateTransactionModel = require('../models/ValidateTransactionModel')

// @route   POST api/validate-transaction
// @desc    Get four ending digits of current user's accounts number
// @access  private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    BankAccountModel.findOne({ user: req.user.id })
        .then(currentUser => {
            // console.log(currentUser.accountNumber.slice(-4))

            const errors = {}

            const validateTransactionDetails = new ValidateTransactionModel({ 
                user: req.user.id,
                fourEndingDigits: req.body.fourEndingDigits 
            })

            validateTransactionDetails
                .save()
                .then(user => {
                    // console.log(user)

                    // Get the four ending digits of current user brfore proceeding with transfer actions
                    if (user.fourEndingDigits.toString() === currentUser.accountNumber.slice(-4)) {
                        return res.json(user)
                    }
                    else {
                        errors.error = 'You are NOT authorized'
                        return res.status(404).json(errors)
                    }
                })
        })
})

module.exports = router