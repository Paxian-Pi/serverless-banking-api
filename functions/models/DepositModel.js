const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DepositSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    depositeAmount: {
        type: Number,
        required: true
    },
    referenceId: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const DepositModel = mongoose.model('deposits', DepositSchema)

module.exports = DepositModel