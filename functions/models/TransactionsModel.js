const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    transactionType: {
        type: String
    },
    transactionAmount: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const TransactionsModel = mongoose.model('transactions', TransactionsSchema)

module.exports = TransactionsModel