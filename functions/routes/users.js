const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const passport = require('passport')


// Load Input validation
const validateRegisterInput = require('../validation/register')
const validateLoginInput = require('../validation/login')

// Load UserModel
const UserModel = require('../models/UserModel')

// @route   GET api/users/test
// @desc    Test users route
// @access  public
router.get('/test', (req, res) => res.json({ message: 'Users route works!' }))

// @route   POST api/users/register
// @desc    Register/Signup user
// @access  public

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      BearerAuth:
 *          type: http
 *          scheme: bearer
 *  schemas:
 *      UserModel:
 *          type: object
 *          properties:
 *              fullname:
 *                  type: string
 *                  description: User name
 *              email:
 *                  type: string
 *                  description: User email
 *              password:
 *                  type: string
 *                  description: User password
 *              password2:
 *                  type: string
 *                  description: Confirm password
 *          required:
 *              - fullname
 *              - email
 *              - password
 *              - password2
 *          example:
 *              fullname: Sussex Wind
 *              email: sussex.io@gmail.com
 *              password: '123456'
 *              password2: '123456'
 */

/**
 * @swagger
 * /api/user/register:
 *  post:
 *      summary: Create new users
 *      tags: [UserModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/UserModel'
 *      responses:
 *          200:
 *              description: New user created
 */
router.post('/register', (req, res) => {

    const { errors, isValid } = validateRegisterInput(req.body)

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    UserModel.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                errors.error = 'Email already exists!'
                return res.status(400).json(errors)
            }
            else {
                const newUser = new UserModel({
                    fullname: req.body.fullname,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err

                        newUser.password = hash

                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
})

// @route   POST api/users/login
// @desc    Login user / Returning JWT
// @access  public

/**
 * @swagger
 * /api/user/login:
 *  post:
 *      summary: Login users / returning JWT (The 'fullname' AND 'password2' fields are NOT required here... You may remove them before making a request)
 *      tags: [UserModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/UserModel'
 *      responses:
 *          200:
 *              description: Successful login
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/UserModel'
 *          400:
 *              description: Bad Request
 */
router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body)

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }

    const email = req.body.email
    const password = req.body.password

    UserModel.findOne({ email }).then(user => {
        if (!user) {
            errors.error = 'User not found'
            return res.status(400).json(errors)
        }

        // Compare password
        bcrypt.compare(password, user.password)
            .then(isMatch => {
                if (isMatch) {

                    // Create JWT Payload
                    const payload = { id: user.id, fullname: user.fullname }

                    // Synchronously sign the retrived payload into a JSON Web Token string payload
                    jwt.sign(
                        payload,
                        keys.secretOrKey,
                        { expiresIn: 900 },
                        (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            })
                        }
                    )
                }
                else {
                    errors.error = 'Incorrect pssword'
                    return res.status(400).json(errors)
                }
            })
    })
})

// @route   GET api/users/all
// @desc    Get all registered users
// @access  public

/**
 * @swagger
 * /api/user/all:
 *  get:
 *      summary: Get all registered users
 *      tags: [UserModel]
 *      responses:
 *          200:
 *              description: All registered users
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/UserModel'
 */
router.get('/all', (req, res) => {

    UserModel
        .find()
        .sort({ date: -1 })
        .then(users => res.json(users))
        .catch(err => res.status(404).json(err))
})

// @route   GET api/user/user-email/:user_email
// @desc    Get current user by email
// @access  public

/**
 * @swagger
 * /api/user/user-email/{user_email}:
 *  get:
 *      summary: Get current user by email
 *      tags: [UserModel]
 *      parameters:
 *          -   in: path
 *              name: user_email
 *              schema:
 *                  type: string
 *              required: true
 *              description: Current user's ID
 *      responses:
 *          200:
 *              description: Current user
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/UserModel'
 */
router.get('/user-email/:user_email', (req, res) => {

    UserModel
        .findOne({ email: req.params.user_email })
        .then(users => res.json(users))
        .catch(err => res.status(404).json(err))
})

module.exports = router