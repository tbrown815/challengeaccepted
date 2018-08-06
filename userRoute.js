"use strict";

const express = require('express');

const router = express.Router();

const {exerStatsModel, userInfoModel} = require('./models')

router.get('/', (req, res) => {

    userInfoModel.find()
    .then(users => {
        res.json({users: users.map(
            (user) => user.cleanUp()
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

    userInfoModel.findById(req.params.id)
    .then(user => {
        res.json(user.cleanUp())
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'unable to find id'});
    })
})





module.exports = router;