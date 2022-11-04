const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BankAccountSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    bankName: {
        type: String,
        default: 'PxB'
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

const BankAccountModel = mongoose.model('accounts', BankAccountSchema)

module.exports = BankAccountModel