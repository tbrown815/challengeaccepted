"use strict";

const express = require('express');

const router = express.Router();

const {exerStatsModel, userInfoModel} = require('./models')

router.get('/', (req, res) => {

    exerStatsModel.find()
    .then(exerstats => {
        res.json({exerstats: exerstats.map(
            (exerstat) => exerstat.cleanUp()
            )}
        )
    })
    //ERROR CATCHER
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'Something is broken'});
    });
})

router.get('/:id', (req, res) => {

    exerStatsModel.findById(req.params.id)
    .then(exerstat => {
        res.json(exerstat.cleanUp())
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'unable to find id'});
    })
})


//POST
router.post('/', (req, res) => {

    const requiredFields = ['user', 'date', 'exerType'];

    for (let i=0; i<requiredFields; i++) {
        const field = requiredFields[i];

        if(!(field in req.body)) {
            const errMessage = `${field} is missing from your request`
            console.error(errMessage);
            res.status(400).send(errMessage);
        }
    }

    userInfoModel.findById(req.body.user, function (err, _user) {
        req.body.user = _user;
    })

    .then(user => {
        if(!(user)) {
            const errMessage = `User not found`
            console.error(errMessage);
            res.status(400).send(errMessage);        }

        else {
            exerStatsModel.create({
                user: req.body.user,
                date: req.body.date,
                exerType: req.body.exerType,
                steps: req.body.steps,
                distance: req.body.distance
            })

            .then(stats => {
                res.status(201).json(stats.cleanUp())
            })

            .catch(err => {
                console.error(err)
                res.status(500).json({"error message": "There was an issue adding the data - 001"})
            })
        }
    })
        .catch(err => {
            console.error(err)
            res.status(500).json({"error message": "There was an issue adding the data - 002"})
        })
});




module.exports = router;