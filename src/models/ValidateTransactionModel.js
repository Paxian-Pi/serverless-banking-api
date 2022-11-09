const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ValidateTransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    validattionNumber: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const ValidateTransactionModel = mongoose.model('transactionvalidations', ValidateTransactionSchema)

module.exports = ValidateTransactionModel