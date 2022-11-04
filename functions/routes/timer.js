const express = require('express')
const router = express.Router()
const passport = require('passport')

const TimerModel = require('../models/TimerModel')

// @route   GET api/timer/countdown
// @desc    Get server countdown timer
// @access  public

/**
 * @swagger
 * components:
 *  schemas:
 *      TimerModel:
 *          type: object
 *          properties:
 *              startTimer:
 *                  type: string
 *                  description: Start timer
 *          required:
 *              - startTimer
 *          example:
 *              startTimer: start
 */

/**
 * @swagger
 * /api/timer/countdown:
 *  post:
 *      summary: Get server countdown timer
 *      tags: [TimerModel]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/TimerModel'
 *      responses:
 *          200:
 *              description: Server countdown timer
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/TimerModel'
 */
router.post('/countdown', (req, res) => {

    const interval = setInterval(() => {
        var d = new Date(); // get current time or OTP expiry time in data-time format
        var seconds = d.getMinutes() * 60 + d.getSeconds();
        var fiveMin = 60 * 1; // five minutes is 300 seconds!
        var timeleft = fiveMin - seconds % fiveMin; // if now is 01:30, then current seconds is 60+30 = 90. And 90%300 = 90, finally 300-90 = 210. That's the time left!
        var result = parseInt(timeleft / 60) + ':' + timeleft % 60; // formart seconds back into mm:ss
        
        console.log(d.getSeconds())
        console.log(result)
        
        if (result == '0:1') {
            clearInterval(interval)
        }
    }, 1000)
    

    
    const timer = new TimerModel({
        startTimer: req.body.startTimer,
        minutes: 3,
        seconds: 45
    })

    timer
        .save()
        .then((isTimer) => {
            console.log(isTimer)

            const countDownTime = {
                minutes: isTimer.minutes,
                seconds: isTimer.seconds
            }

            res.json(countDownTime)

        })
        .catch((err) => res.status(404).json(err))
})

module.exports = router