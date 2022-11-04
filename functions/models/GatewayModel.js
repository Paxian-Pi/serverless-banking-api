const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GatewaySchema = new Schema({
    groupName: {
        type: String,
        required: true
    },
    location: [
        {
            city: {
                type: String,
                required: true
            },
            isChecked: {
                type: Boolean,
                required: true
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now()
    }
})

const GatewayModel = mongoose.model('gateways', GatewaySchema)

module.exports = GatewayModel