const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WithdrawalSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    withdrawAmount: {
        type: Number,
        required: true
    },
    recipientBank: {
        type: String,
        required: true
    },
    recipientAccountNumber: {
        type: String,
        required: true
    },
    isWithdrawn: {
        type: Boolean
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const WithdrawalModel = mongoose.model('withdrawal', WithdrawalSchema)

module.exports = WithdrawalModel