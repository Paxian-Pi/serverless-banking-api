const { json } = require('body-parser')
const express = require('express')
const router = express.Router()

const NetworkModel = require('../models/NetworkModel')

// @route   POST api/network/
// @desc    Create network
// @access  public
router.post('/create', (req, res) => {

    NetworkModel.findOne({ label: req.body.label })
        .then((network) => {

            // console.log(network)

            if (network != null && network.label == req.body.label) {
                return res.status(404).json({ 'error': 'Network already exists!' })
            }
            
            new NetworkModel({ label: req.body.label, value: req.body.value })
                .save()
                .then(networkDetails => res.json(networkDetails))
                .catch(err => res.status(404).json(err))
        })
})

// @route   POST api/network/network-data
// @desc    Modify Network
// @access  public
router.post('/modify', (req, res) => {
    
    NetworkModel.findOneAndUpdate(
        { value: req.body.value },
        { $set: { label: req.body.label, value: req.body.value } },
        { new: true }
    ).then(data => res.json(data))
})

// @route   GET api/network/all
// @desc    Network route
// @access  public
router.get('/get-all', (req, res) => {
    NetworkModel
        .find()
        .then(data => res.json(data))
})

module.exports = router