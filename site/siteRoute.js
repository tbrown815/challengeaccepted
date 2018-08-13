"use strict";

const express = require('express');

//* Create a constant bodyParser to require body-parser
const bodyParser = require('body-parser');

const {exerStatsModel, userInfoModel} = require('../models')

const router = express.Router();

const passport = require('passport');

const jwt = require('jsonwebtoken');

//* create const for jsson Parser that calls bodyParser json with no args
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', {session: false});

//FIND ALL STATS

router.get('/', jwtAuth, (req, res) => {
//router.get('/', (req, res) => {

    exerStatsModel.find()
    .then(userStats => {
        res.json({userStats: userStats.map(
            (userStats) => userStats.cleanUp()
            )}
        )
    })
    //ERROR CATCHER
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'Something is broken'});
    });
})


//FIND STATS BY STAT ID

router.get('/:id', jwtAuth, (req, res) => {
//router.get('/:id', (req, res) => {

    exerStatsModel.findById(req.params.id)
    .then(stats => {
        res.json(stats.cleanUp())
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'unable to find id'});
    })
})



//FIND STATS BY USERS ID

router.get('/stats/:id', jwtAuth, (req, res) => {
//router.get('/stats/:id', (req, res) => {

    exerStatsModel.find({user: req.params.id})
    .then(userStats => {
        res.json({userStats: userStats.map(
            (userStats) => userStats.cleanUp()
            )}
        )
    })
    //ERROR CATCHER
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'Something is broken'});
    });
});



//USER POST NEW STATS

router.post('/', jsonParser, jwtAuth, (req,res) => {

    const requiredFields = ['user', 'date', 'exertype', 'steps' || 'distance'];

    const noField = requiredFields.find(field => !(field in req.body));

  if (noField) {
    return res.status(422).json(
    {code: 422,
      reason: 'ERROR',
      message: 'Field is not present',
      location: noField
    });
  }

  /* WEIRD ERROR - errMessage {field} is not defined???
    const areNum = ['steps', 'distance'];

    const notNum = areNum.find(field =>
        field in req.body && typeof req.body[field] !== 'number');

    if(notNum) {
        const errMessage = `${field} is not of the correct type`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    */


    const trimmedFields = ['date', 'exertype', 'steps', 'distance'];
    const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if(notTrimmedFields) {
        const errMessage = `${notTrimmedFields} cannot start or end with whitespace`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    userInfoModel.findById(req.body.user, function (err, theUser) {
        req.body.user = theUser;
    })

    .then(theUser => {

        if(!(theUser)) {
            const errMessage = 'user not found';
            console.error(errMessage);
            return res.status(400).send(errMessage);
        }
        else {
        
            exerStatsModel.create(
            {user: req.body.user,
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
            res.status(500).json({"error message": "something went wrong"})
        });


        }

    })
           
    //ERROR CATCHER
        .catch(err => {
            console.error(err)
            res.status(500).json({"error message": 'bam unable to post data'})
            
        }) 
    
});


//UPDATE EXER

router.put('/:id', jsonParser, jwtAuth, (req,res) => {

    const requiredFields = ['id'];

    const noField = requiredFields.find(field => !(field in req.body));

  if (noField) {
    return res.status(422).json(
    {code: 422,
      reason: 'ERROR',
      message: 'Field is not present',
      location: noField
    });
  }
    
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {

        const putErrMessage = `${req.params.id} and ${req.body.id} must match`
        console.error(putErrMessage)
        return res.status(400).send(putErrMessage);
    }


    const toUpdate = {};

    const updateAllowed = ['date', 'exertype', 'steps', 'distance'];

    updateAllowed.forEach(data => {
        if(data in req.body) {
            toUpdate[data] = req.body[data];
        }
    });

    exerStatsModel.findByIdAndUpdate(req.params.id, {$set: toUpdate})

    .then(data =>
        res.status(204).json({"message": `${req.body.id} has been updated`}))

})


//DELETE EXER
router.delete('/:id', jwtAuth, (req,res) => {

    exerStatsModel.findByIdAndRemove(req.params.id)

    .then(data => {
        res.status(204).json({message: `${req.params.id} has been removed`}).end();
    })
    

    .catch(err => {

        console.error(err);

        res.status(500).json({"error message": 'error occurred while deleting'})

    })

})


module.exports = router;