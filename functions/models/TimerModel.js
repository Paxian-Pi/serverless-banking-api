const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TimerSchema = new Schema({
    startTimer: {
        type: String,
        required: true
    },
    minutes: {
        type: Number
    },
    seconds: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const TimerModel = mongoose.model('timer', TimerSchema)

module.exports = TimerModel