'use strict';

const express = require('express');

const bodyParser = require('body-parser');

const { exerStatsModel, userInfoModel } = require('../models')

const router = express.Router();

const passport = require('passport');

const jwt = require('jsonwebtoken');

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

//FIND ALL STATS

router.get('/', jwtAuth, (req, res) => {

    exerStatsModel.find()
        .then(userStats => {
            res.json({
                userStats: userStats.map(
                    (userStats) => userStats.cleanUp()
                )
            }
            )
        })
        //ERROR CATCHER
        .catch(err => {
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "1", "message": 'Something is broken' });
        });
})


//FIND STATS BY STAT ID

router.get('/:id', jwtAuth, (req, res) => {

    exerStatsModel.findById(req.params.id)
        .then(stats => {
            res.json(stats.cleanUp())
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'unable to find id' });
        })
})



//FIND STATS BY USERS ID

router.get('/stats/:id', jwtAuth, (req, res) => {

    exerStatsModel.find({ user: req.params.id }).sort({ 'date': -1, 'exertype': 1 }).limit(10)
        .then(userStats => {
            res.json({
                userStats: userStats.map(
                    (userStats) => userStats.cleanUp()
                )
            }
            )
        })
        //ERROR CATCHER
        .catch(err => {
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'unable to find id' });
        });
});



//USER POST NEW STATS

router.post('/', jsonParser, jwtAuth, (req, res) => {

    const requiredFields = ['user', 'date', 'exertype', 'steps' || 'distance'];

    const noField = requiredFields.find(field => !(field in req.body));

    if (noField) {
        return res.status(422).json(
            {
                code: 422,
                reason: 'ERROR',
                message: ' is not present',
                location: noField
            });
    }

    const trimmedFields = ['date', 'exertype', 'steps', 'distance'];
    const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if (notTrimmedFields) {
        const errMessage = `${notTrimmedFields} cannot start or end with whitespace`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    userInfoModel.findById(req.body.user, function (err, theUser) {
        req.body.user = theUser;
    })

        .then(theUser => {

            if (!(theUser)) {
                const errMessage = 'user not found';
                console.error(errMessage);
                return res.status(400).send(errMessage);
            }
            else {

                exerStatsModel.create(
                    {
                        user: req.body.user,
                        date: req.body.date,
                        exertype: req.body.exertype,
                        steps: req.body.steps,
                        distance: req.body.distance
                    })
                    .then(stats => {
                        res.status(201).json(stats.cleanUp())
                    })

                    .catch(err => {
                        console.error(err)
                        res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": "something went wrong" })
                    });


            }

        })

        //ERROR CATCHER
        .catch(err => {
            console.error(err)
            res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'unable to post data' })

        })

});


//UPDATE EXER STATS

router.put('/:id', jsonParser, jwtAuth, (req, res) => {

    const requiredFields = ['id'];

    const noField = requiredFields.find(field => !(field in req.body));

    if (noField) {
        return res.status(422).json(
            {
                code: 422,
                reason: 'ERROR',
                message: 'Field is not present',
                location: noField
            });
    }

    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {

        const putErrMessage = `req.params.id and req.body.id must match`
        console.error(putErrMessage)
        return res.status(422).send(putErrMessage);
    }


    const toUpdate = {};

    const updateAllowed = ['date', 'exertype', 'steps', 'distance'];

    updateAllowed.forEach(data => {
        if (data in req.body) {
            toUpdate[data] = req.body[data];
        }
    });

    exerStatsModel.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true }, function () {
        res.json({ "code": "200", "reason": "SUCCESS", "location": "", "message": `User record has been updated` })

    })

});

//DELETE EXER STATS
router.delete('/:id', jwtAuth, (req, res) => {

    return exerStatsModel.findById(req.params.id)

        .count()
        .then(count => {

            if (count < 1) {

                return res.status(422).json({ "code": "422", "reason": "ERROR", "location": "ID", "message": 'User record does not exist' });

            }

            exerStatsModel.findByIdAndRemove(req.params.id, function () {
                res.json({ "code": "200", "reason": "SUCCESS", "location": "", "message": `User record has been removed` })
            })

                .catch(err => {

                    console.error(err);

                    res.status(500).json({ "code": "500", "reason": "ERROR", "location": "", "message": 'error occurred while deleting' })
                })
        })

})

module.exports = router;