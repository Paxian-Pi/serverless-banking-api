const { json } = require('body-parser')
const express = require('express')
const router = express.Router()

const GatewayModel = require('../models/GatewayModel')

// @route   POST api/gateway/create
// @desc    Create network
// @access  public
router.post('/create', (req, res) => {

    // new GatewayModel({ groupName: req.body.groupName })
    //     .save()
    //     .then(() => {
    //         // console.log(data)
    //         GatewayModel.findOne({ groupName: req.body.groupName })
    //             .then((gatewayData) => {

    //                 const data = { groupName: req.body.groupName, city: req.body.city }

    //                 gatewayData.gateway.unshift(data)
    //                 gatewayData.save().then(() => {
    //                     GatewayModel.findOne({ groupName: req.body.groupName })
    //                         .then((gateway) => {

    //                             res.json(gateway.location)

    //                             // const data = { city: req.body.city }

    //                             // gateway.location.unshift(data)
    //                             // gateway.save().then((rez) => res.json(rez))
    //                         })
    //                 })
    //             })
    //     })
    //     .catch(err => res.status(404).json(err))

    GatewayModel.findOne({ groupName: req.body.groupName })
        .then((gateway) => {

            // console.log(gateway)
            // res.json(gateway)

            if (gateway != null && gateway.location[0].city == req.body.city) {
                return res.status(404).json({ 'error': `${req.body.city} gateway already exists!` })
            }

            if (gateway == null) {
                new GatewayModel({ groupName: req.body.groupName })
                    .save()
                    .then(() => {
                        // console.log(data)
                        GatewayModel.findOne({ groupName: req.body.groupName })
                            .then((gatewayData) => {
                                const loc = { city: req.body.city, isChecked: req.body.isChecked }

                                gatewayData.location.unshift(loc)
                                gatewayData.save().then(location => res.json(location))
                            })
                    })
                    .catch(err => res.status(404).json(err))
            }
            else {
                GatewayModel.findOne({ groupName: req.body.groupName })
                    .then((gatewayData) => {
                        const loc = { city: req.body.city, isChecked: req.body.isChecked }

                        gatewayData.location.unshift(loc)
                        gatewayData.save().then(location => res.json(location))
                    })
            }

        })
})

// @route   POST api/network/network-data
// @desc    Modify Network
// @access  public
router.post('/modify', (req, res) => {

    GatewayModel.findOneAndUpdate(
        { "location.city": req.body.city },
        { $set: { "location.$.isChecked": req.body.isChecked } },
        { new: true }
    )
        .then(data => res.json(data))
        .catch(err => res.status(404).json(err))
})

// @route   GET api/gateway/get-all
// @desc    Network route
// @access  public
router.get('/get-all', (req, res) => {
    GatewayModel
        .find()
        .then(data => res.json(data))
})

module.exports = router