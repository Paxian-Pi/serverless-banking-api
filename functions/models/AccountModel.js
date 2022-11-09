const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    bankName: {
        type: String,
        default: 'Paxian Bank'
    },
    balance: {
        type: Number,
        default: 0
    },
    accountNumber: {
        type: String,
        required: true
    },
    transactionPIN: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const AccountModel = mongoose.model('accounts', AccountSchema)

module.exports = AccountModel