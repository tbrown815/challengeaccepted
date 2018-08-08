"use strict";

const express = require('express');

//*
const bodyParser = require('body-parser');

const router = express.Router();

//*
const jsonParser = bodyParser.json();

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

//*
//POST to create a user
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email'];

    for (let i=0; i<requiredFields; i++) {
        const field = requiredFields[i];

        if(!(field in req.body)) {
            const errMessage = `${field} is missing in your request`
            console.error(errMessage);
            return res.status(422).send(errMessage);
        }
    };

    const areStrings = ['username', 'password', 'firstName', 'lastName', 'email'];

    const notString = areStrings.find(field => 
    field in req.body && typeof req.body[field] !== 'string');

    if(notString) {
        const errMessage = `${field} is not of the correct type`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    const trimmedFields = ['username', 'password', 'email'];
    const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if(notString) {
        const errMessage = `${field} cannot start or end with whitespace`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    const userPassLength = {
        username: {min: 8, max: 30},
        password: {min: 12, max: 60}
    };

    const tooShort = Object.keys(userPassLength).find(field => 'min' in userPassLength[field] && req.body[field].trim().length < userPassLength[field].min);
    const tooLong = Object.keys(userPassLength).find(field => 'max' in userPassLength[field] && req.body[field].trim().length > userPassLength[field].max);

    if (tooShort || tooLong) {
        const errMessage = `${userPassLength[tooShort].min} is the minimum length, ${userPassLength[tooShort].max} is the maximum length`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };


    let {username, password, firstName = '', lastName = '', email} = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();

    return userInfoModel.find({username})
    .count()
    .then(count => {
        if (count > 0) {
            const errMessage = `username already exists`
            console.error(errMessage);
            return res.status(422).send(errMessage).done();
            };

    return userInfoModel.hashPass(password);
        
    })
    .then(hash => {
        return userInfoModel.create({
            username,
            password: hash,
            firstName,
            lastName,
            email
        });
    })
    .then(user => {
        return res.status(201).json(user.cleanUp());
    })
    .catch(err => {
        console.error(err)
        return res.status(500).json({"error message": 'something is broken'});
    })

})



module.exports = router;