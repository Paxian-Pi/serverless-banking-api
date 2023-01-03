const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const path = require('path')

const serverless = require('serverless-http')

// Initialize port
const port = process.env.PORT || 5000

// Define Routes
const users = require('../functions/routes/users')
const accounts = require('../functions/routes/accounts')
const timer = require('../functions/routes/timer')
const upload = require('../functions/routes/fileUpload')
const network = require('../functions/routes/network')
const gateway = require('../functions/routes/gateway')

// Initialize app
const app = express()
const router = express.Router()

// Configure cross origin
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))

//  Configure Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Banking API',
            version: '1.0.0',
            contact: {
                email: "paxian.pi@gmail.com",
            }
        },
        servers: [
            { url: 'https://serverless-banking-api.netlify.app' },
            { url: `http://localhost:8888` }
        ],
    },
    apis: [`${path.join(__dirname, '../functions/routes/*.js')}`],
}

const specs = swaggerJsDoc(swaggerOptions)
router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs))

// Configure midleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Passport initialization
app.use(passport.initialize())

// Passport config
require('../functions/config/passport')(passport)

// Configure Db
const db = require('../functions/config/keys').mongoURI

// Connect to MongoDB
mongoose.connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(() => console.log('Can\'t connect to MongoDB... Please check the internet!'))

// Test server
router.get('/test', (req, res) => res.json({ message: 'Welcome! The finance API' }))

// Use Routes
// app.use('/.netlify/functions/server', router)
app.use('/', router)
app.use('/api/users', users)
app.use('/api/account', accounts)
app.use('/api/timer', timer)
app.use('/api/upload', upload)
app.use('/api/network', network)
app.use('/api/gateway', gateway)

// module.exports=app
module.exports.handler = serverless(app)