const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransferSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    transferAmount: {
        type: Number,
        required: true
    },
    recipientAccountNumber: {
        type: String,
        required: true
    },
    recipientName: {
        type: String,
        required: true
    },
    isTransfered: {
        type: Boolean
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const TransaferModel = mongoose.model('transfers', TransferSchema)

module.exports = TransaferModel