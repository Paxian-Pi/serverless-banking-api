const express = require('express')
const router = express.Router()
const passport = require('passport')

// Load validation
const validateAccountInput = require('../validation/account')

// Load models
const BankAccountModel = require('../models/BankAccountModel')
const TransferModel = require('../models/TransferModel')
const WithdrawalModel = require('../models/WithdrawalModel')
const DepositModel = require('../models/DepositModel')
const TransactionsModel = require('../models/TransactionsModel')
const ValidateTransactionModel = require('../models/ValidateTransactionModel')

// @route   GET api/accounts/test
// @desc    Tests account route
// @access  public
router.get('/test-account', (req, res) => res.json({ message: "Account Works" }))


// @route   POST api/accounts/create-account
// @desc    Create current user's account
// @access  private

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *          description: Ensure to only add authorization token WITHOUT the 'Bearer' prefix!
 *  schemas:
 *      BankAccountModel:
 *          type: object
 *          properties:
 *              accountNumber:
 *                  type: string
 *                  description: User's account number = user's phone number
 *              transactionPIN:
 *                  type: integer
 *                  description: Transaction validation PIN
 *          required:
 *              - accountNumber
 *          example:
 *              accountNumber: "08093530000"
 *              transactionPIN: '1706'
 */

/**
 * @swagger
 * /api/account/create-account:
 *  post:
 *      security:
 *          - BearerAuth: []
 *      summary: Create user's bank account
 *      tags: [BankAccountModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/BankAccountModel'
 *      responses:
 *          200:
 *              description: Bank account created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/BankAccountModel'
 *          400:
 *              description: Bad Request
 */
router.post('/create-account', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateAccountInput(req.body)

    // Check validation
    if (!isValid) {
        return res.status(404).json(errors)
    }
    
    const bankAccount = new BankAccountModel({
        user: req.user.id,
        accountNumber: req.body.accountNumber,
        transactionPIN: req.body.transactionPIN
    })

    // Prevent creating multiple account
    BankAccountModel.findOne({ accountNumber: req.body.accountNumber })
        .then(account => {

            // console.log(account)

            if (account) {
                errors.error = 'Account number already exists!'
                return res.status(404).json(errors)
            }
            
            // Save account
            bankAccount
                .save()
                .then(account => res.json(account))
        })
})

// @route   GET api/accounts/all
// @desc    Get all bank accounts
// @access  public

/**
 * @swagger
 * /api/account/all:
 *  get:
 *      summary: Get all bank accounts
 *      tags: [BankAccountModel]
 *      responses:
 *          200:
 *              description: All created bank accounts
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/BankAccountModel'
 */
router.get('/all', (req, res) => {

    BankAccountModel
        .find()
        .sort({ date: -1 })
        .populate('user', ['fullname', 'email'])
        .then(account => res.json(account))
        .catch(err => res.status(400).json(err))
})

// @route   GET api/accounts/current-user/:user_id
// @desc    Get current user's bank accounts info
// @access  public

/**
 * @swagger
 * /api/account/current-user/{user_id}:
 *  get:
 *      summary: Get current user's bank account info
 *      tags: [BankAccountModel]
 *      parameters:
 *          -   in: path
 *              name: user_id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Current user's ID
 *      responses:
 *          200:
 *              description: Current user's bank account
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/BankAccountModel'
 */
router.get('/current-user/:user_id', (req, res) => {

    const errors = {};

    BankAccountModel
        .findOne({ user: req.params.user_id })
        .sort({ date: -1 })
        .populate('user', ['fullname', 'email'])
        .then(account => {
            if (!account) {
                errors.error = 'Account does not exist!'
                return res.status(404).json(errors)
            }

            res.json(account)
        })
        .catch(err => res.status(400).json(err))
})

// @route   POST api/accounts/tranfer
// @desc    Transfer funds to other users
// @access  private

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *          description: Ensure to only add authorization token WITHOUT the 'Bearer' prefix!
 *  schemas:
 *      TransferModel:
 *          type: object
 *          properties:
 *              transferAmount:
 *                  type: string
 *                  description: Amount to be transfered
 *              recipientAccountNumber:
 *                  type: string
 *                  description: Account number of recipient
 *              recipientName:
 *                  type: string
 *                  description: Name of recipient (must also be registered)
 *          required:
 *              - transferAmount
 *              - recipientAccountNumber
 *              - recipientName
 *          example:
 *              transferAmount: "10500"
 *              recipientAccountNumber: "08093530000"
 *              recipientName: "Sussex Wind"
 */

/**
 * @swagger
 * /api/account/transfer:
 *  post:
 *      security:
 *          - BearerAuth: []
 *      summary: Transfer funds to other users (Please ensure the account number matches the exact recipient, for tests purposes... otherwise, funds will be moved to the user it matches, if number exists in database OR permanently lost)
 *      tags: [TransferModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/TransferModel'
 *      responses:
 *          200:
 *              description: Funds successfully transfered
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/TransferModel'
 *          400:
 *              description: Bad Request
 */
router.post('/transfer', passport.authenticate('jwt', { session: false }), (req, res) => {

    BankAccountModel
        .find()
        .populate('user', ['fullname'])
        .then(account => {
            // console.log(account)

            const errors = {}

            const accountNames = account.map(accountName => accountName.user.fullname)

            // console.log(accountNames.indexOf(req.body.recipientName) === -1)

            // Check if recipient is registered
            if (accountNames.indexOf(req.body.recipientName) === -1) {
                errors.error = "You can ONLY transfer funds to registered recipients!"
                return res.status(404).json(errors)
            }

            // Prevent from transafering to self
            if (req.body.recipientName !== req.user.fullname) {

                const transferDetails = new TransferModel({
                    user: req.user.id,
                    recipientAccountNumber: req.body.recipientAccountNumber,
                    transferAmount: req.body.transferAmount,
                    recipientName: req.body.recipientName
                })

                // Get current user
                BankAccountModel.findOne({ user: req.user.id })
                    .then(currentUser => {

                        const currentUserBalance = currentUser.balance

                        // Check if balance of current user is sufficient for transfer actions
                        if (currentUserBalance < transferDetails.transferAmount) {
                            errors.error = "Funds NOT sufficient!"
                            return res.status(404).json(errors)
                        }

                        // Save the transaction
                        transferDetails
                            .save()
                            .then((transfered) => {

                                // Populate transaction hystory collection
                                new TransactionsModel({
                                    user: req.user.id,
                                    transactionType: 'Transfer',
                                    transactionAmount: transfered.transferAmount
                                }).save()

                                // Get the recipient
                                BankAccountModel.findOne({ accountNumber: req.body.recipientAccountNumber })
                                    .then(recipient => {

                                        if (recipient === null) {
                                            errors.invalid = "Account number does NOT belong to this recipient!"
                                            return res.status(404).json(errors)
                                        }

                                        const newBalance = (recipient.balance + transfered.transferAmount)

                                        // Update recipient's balance
                                        BankAccountModel.findOneAndUpdate(
                                            { accountNumber: transferDetails.recipientAccountNumber },
                                            { $set: { balance: newBalance } },
                                            { new: true }
                                        ).then(() => {
                                            
                                            // Update current user's balance
                                            const newBalance = (currentUserBalance - transfered.transferAmount)

                                            BankAccountModel.findOneAndUpdate(
                                                { user: req.user.id },
                                                { $set: { balance: newBalance, bankName: 'PxB' } },
                                                { new: true }
                                            ).then(done => res.json(done))
                                        })
                                    })
                            })
                            .catch(() => {
                                errors.error = "Funds NOT transfered!"
                                res.status(404).json(errors)
                            })
                    })

            }
            else {
                errors.invalid = "You tried to tranfer funds to yourself!"
                return res.status(404).json(errors)
            }
        })
})

// @route   POST api/accounts/withdraw
// @desc    Withdraw funds TO third-party bank
// @access  private

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *          description: Ensure to only add authorization token WITHOUT the 'Bearer' prefix!
 *  schemas:
 *      WithdrawalModel:
 *          type: object
 *          properties:
 *              withdrawAmount:
 *                  type: string
 *                  description: Amount to be withdrawn
 *              recipientBank:
 *                  type: string
 *                  description: Name of bank where withdrawal will be credited
 *              recipientAccountNumber:
 *                  type: string
 *                  description: Account number where withdrawal will be credited
 *          required:
 *              - withdrawAmount
 *              - recipientBank
 *              - recipientAccountNumber
 *          example:
 *              withdrawAmount: "50000"
 *              recipientBank: "Fidelity Bank"
 *              recipientAccountNumber: "0123456789"
 */

/**
 * @swagger
 * /api/account/withdraw:
 *  post:
 *      security:
 *          - BearerAuth: []
 *      summary: Withdraw funds TO third-party bank
 *      tags: [WithdrawalModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/WithdrawalModel'
 *      responses:
 *          200:
 *              description: Funds successfully withdrawn
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/WithdrawalModel'
 *          400:
 *              description: Bad Request
 */
router.post('/withdraw', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {}

    const withdrawDetails = new WithdrawalModel({
        user: req.user.id,
        recipientAccountNumber: req.body.recipientAccountNumber,
        withdrawAmount: req.body.withdrawAmount,
        recipientBank: req.body.recipientBank
    })

    BankAccountModel.findOne({ user: req.user.id })
        .then(currentBalance => {

            // Check if user has bank account
            if (currentBalance !== null) {

                // Get the balance of the current user
                const currentUserBalance = currentBalance.balance

                if (currentUserBalance < withdrawDetails.withdrawAmount) {
                    errors.error = "Funds NOT sufficient!"
                    return res.status(404).json(errors)
                }

                // Save the transaction
                withdrawDetails
                    .save()
                    .then((withdrawn) => {

                        // Populate transaction hystory collection
                        new TransactionsModel({
                            user: req.user.id,
                            transactionType: 'Withdrawal',
                            transactionAmount: withdrawn.withdrawAmount
                        }).save()

                        BankAccountModel.findOne({ user: req.user.id })
                            .then(currentUser => {

                                const newBalance = (currentUser.balance - withdrawn.withdrawAmount)

                                // Update current balance
                                BankAccountModel.findOneAndUpdate(
                                    { user: req.user.id },
                                    { $set: { balance: newBalance, bankName: req.body.recipientBank } },
                                    { new: true }
                                ).then(done => res.json(done))
                            })
                    })
                    .catch(() => {
                        errors.error = "Funds NOT withdrawn!"
                        res.status(404).json(errors)
                    })
            }
            else {
                errors.error = "You have not yet created your bank account!"
                return res.status(404).json(errors)
            }
        })
})

// @route   POST api/accounts/deposit
// @desc    Deposit funds FROM third-party bank
// @access  private

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *          description: Ensure to only add authorization token WITHOUT the 'Bearer' prefix!
 *  schemas:
 *      DepositModel:
 *          type: object
 *          properties:
 *              depositeAmount:
 *                  type: string
 *                  description: Amount to be withdrawn
 *          required:
 *              - depositeAmount
 *          example:
 *              depositeAmount: "500000"
 */

/**
 * @swagger
 * /api/account/deposit:
 *  post:
 *      security:
 *          - BearerAuth: []
 *      summary: Deposit funds FROM third-party bank
 *      tags: [DepositModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/DepositModel'
 *      responses:
 *          200:
 *              description: Funds successfully deposited
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/DepositModel'
 *          400:
 *              description: Bad Request
 */
router.post('/deposit', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {}

    const depositDetails = new DepositModel({
        user: req.user.id,
        depositeAmount: req.body.depositeAmount
    })

    BankAccountModel.findOne({ user: req.user.id })
        .then(() => {

            // Save the transaction
            depositDetails
                .save()
                .then((deposited) => {

                    // Populate transaction hystory collection
                    new TransactionsModel({
                        user: req.user.id,
                        transactionType: 'Deposit',
                        transactionAmount: deposited.depositeAmount
                    }).save()

                    // Get current user's account details
                    BankAccountModel.findOne({ user: req.user.id })
                        .then(currentUser => {

                            // Check if user has bank account
                            if (currentUser !== null) {

                                const newBalance = (currentUser.balance + deposited.depositeAmount)

                                // Update current balance
                                BankAccountModel.findOneAndUpdate(
                                    { user: req.user.id },
                                    { $set: { balance: newBalance, bankName: 'VeeGil Bank' } },
                                    { new: true }
                                ).then(done => res.json(done))
                            }
                            else {
                                errors.error = "You have not yet created your bank account!"
                                return res.status(404).json(errors)
                            }
                        })
                })
                .catch(() => {
                    errors.error = "Funds NOT deposited!"
                    res.status(404).json(errors)
                })
        })
})

// @route   POST api/accounts/validate-transaction
// @desc    Transaction validation PIN
// @access  private

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *          description: Ensure to only add authorization token WITHOUT the 'Bearer' prefix!
 *  schemas:
 *      ValidateTransactionModel:
 *          type: object
 *          properties:
 *              validattionNumber:
 *                  type: integer
 *                  description: Transaction validation PIN
 *          required:
 *              - validattionNumber
 *          example:
 *              validattionNumber: 1706
 */

/**
 * @swagger
 * /api/account/validate-transaction:
 *  post:
 *      security:
 *          - BearerAuth: []
 *      summary: Validate 'transfer' & 'withdrawal' acttions by comparing 'validation number' with 'transaction PIN' (transaction PIN is created when you create your bank account)
 *      tags: [ValidateTransactionModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/ValidateTransactionModel'
 *      responses:
 *          200:
 *              description: Authorized
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/ValidateTransactionModel'
 *          400:
 *              description: Not authorized to make this transaction
 */
router.post('/validate-transaction', passport.authenticate('jwt', { session: false }), (req, res) => {
    BankAccountModel.findOne({ user: req.user.id })
        .then(currentUser => {

            const errors = {}

            if (currentUser !== null) {
                // console.log(currentUser.accountNumber.slice(-4))

                const validateTransactionDetails = new ValidateTransactionModel({
                    user: req.user.id,
                    validattionNumber: req.body.validattionNumber
                })

                validateTransactionDetails
                    .save()
                    .then(user => {
                        
                        // Compare validation number with validation PIN
                        if (user.validattionNumber === currentUser.transactionPIN) {
                            return res.json(user)
                        }
                        else {
                            errors.error = 'You are NOT authorized'
                            return res.status(404).json(errors)
                        }
                    })
            }
            else {
                errors.error = "You have not yet created your bank account!"
                return res.status(404).json(errors)
            }
        })
})

// @route   GET api/accounts/transactions
// @desc    Get all transaction histories
// @access  public

/**
 * @swagger
 * components:
 *  schemas:
 *      TransactionsModel:
 *          type: object
 */

/**
 * @swagger
 * /api/account/transactions:
 *  get:
 *      summary: Get all transactions hystories
 *      tags: [TransactionsModel]
 *      responses:
 *          200:
 *              description: All transactions
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/TransactionsModel'
 */
router.get('/transactions', (req, res) => {

    TransactionsModel
        .find()
        .sort({ date: -1 })
        .populate('user', ['fullname'])
        .then(transactions => res.json(transactions))
        .catch(err => res.status(404).json(err))
})

// @route   GET api/accounts/transactions/current-user/:user_id
// @desc    Get transaction histories by ID
// @access  public

/**
 * @swagger
 * /api/account/transactions/current-user/{user_id}:
 *  get:
 *      summary: Get transaction histories by ID
 *      tags: [TransactionsModel]
 *      parameters:
 *          -   in: path
 *              name: user_id
 *              schema:
 *                  type: string
 *              required: true
 *              description: Current user's ID
 *      responses:
 *          200:
 *              description: Current user's transactions
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/TransactionsModel'
 */
router.get('/transactions/current-user/:user_id', (req, res) => {

    const errors = {}

    TransactionsModel
        .find({ user: req.params.user_id })
        .sort({ date: -1 })
        .populate('user', ['fullname', 'email'])
        .then(transactions => {
            if (!transactions) {
                errors.error = 'You have not made any transaction!'
                return res.status(404).json(errors)
            }

            res.json(transactions)
        })
        .catch(err => res.status(400).json(err))
})

module.exports = router