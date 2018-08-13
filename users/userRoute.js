"use strict";

const express = require('express');

//* Create a constant bodyParser to require body-parser
const bodyParser = require('body-parser');

const {userInfoModel} = require('../models')

const router = express.Router();

const passport = require('passport');

const jwt = require('jsonwebtoken');

//* create const for jsson Parser that calls bodyParser json with no args
const jsonParser = bodyParser.json();

//const jwtAuth = passport.authenticate('jwt', {session: false});


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

//GET userToken


router.get('/getuser/:username', (req, res) => {

    userInfoModel.findOne({username: req.params.username})
    .then(user => {
        res.json(user.setToken())
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'unable to find user'});
    })
})

/*
router.get('/getuser/:id', (req, res) => {

    userInfoModel.find({username: req.params.username})
    .then(username => {
        res.json({username: username.map(
            (user) => user.cleanUp()
            )}
        )
    })
    //ERROR CATCHER
    .catch(err => {
        console.error(err)
        res.status(500).json({"error message": 'Something is broken'});
    });
});
*/


//*
//POST to create a user
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email'];


    const noField = requiredFields.find(field => !(field in req.body));

  if (noField) {
    return res.status(422).json(
    {code: 422,
      reason: 'ERROR',
      message: 'Field is not present',
      location: noField
    });
  }

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

    if(notTrimmedFields) {
        const errMessage = `${notTrimmedFields} cannot start or end with whitespace`
        console.error(errMessage);
        return res.status(422).send(errMessage);
    };

    const userPassLength = {
        username: {min: 8, max: 30},
        password: {min: 8, max: 60}
    };

    const tooShort = Object.keys(userPassLength).find(field => 'min' in userPassLength[field] && req.body[field].trim().length < userPassLength[field].min);
    const tooLong = Object.keys(userPassLength).find(field => 'max' in userPassLength[field] && req.body[field].trim().length > userPassLength[field].max);

    if (tooShort || tooLong) {
        return res.status(422).json({
          code: 422,
          reason: 'ValidationError',
          message: tooShort
            ? `is required to be at least ${userPassLength[tooShort]
              .min} characters long`
            : `Cannot be greater than ${userPassLength[tooLong]
              .max} characters long`,
          location: tooShort || tooLong
        });
      }

    let {username, password, firstName = '', lastName = '', email} = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();

    return userInfoModel.find({username})
    .count()
    .then(count => {
        
        if (count > 0) {
            return Promise.reject({
              code: 422,
              reason: 'ERROR',
              message: 'Username is in use',
              location: 'username'
            });
          }


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
            if (err.reason === 'ERROR') {
                return res.status(err.code).json(err);
            }
            console.error(err)
            res.status(500).json({"error message": 'something is broken'});
    })

})


//*
//PUT to update user password or E-mail

router.put('/update/:id', jsonParser, (req,res) => {

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

    const updateAllowed = ['email', 'password'];

    updateAllowed.forEach(data => {
        if(data in req.body) {
            toUpdate[data] = req.body[data];
        }
    });

        if(toUpdate.hasOwnProperty('email')) {
            
            const trimmedFields = ['email'];
            const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);
        
            if(notTrimmedFields) {
                const errMessage = `${notTrimmedFields} cannot start or end with whitespace`
                console.error(errMessage);
                return res.status(422).send(errMessage);
            };

        userInfoModel.findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(data => {
            return res.status(204).json({"message": `${req.body.id} e-mail has been updated`}).end()
           // return res.status(204).send(`${req.body.id} e-mail has been updated`).end()
        }
        )
        .catch(err => {
            if (err.reason === 'ERROR') {
                return res.status(err.code).json(err);
            }
            console.error(err)
            res.status(500).json({"error message": 'something is broken'});
        })
    }

/*  THIS IS FOR UPDATE PASSWORD - OUT OF SCOPE FOR MVP - FINISH LATER

        if(toUpdate.hasOwnProperty('password')) {

            const trimmedFields = ['password'];
            const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);
        
            if(notTrimmedFields) {
                const errMessage = `${notTrimmedFields} cannot start or end with whitespace`
                console.error(errMessage);
                return res.status(422).send(errMessage);
            };

            const userPassLength = {
                password: {min: 8, max: 60}
            };
        
            const tooShort = Object.keys(userPassLength).find(field => 'min' in userPassLength[field] && req.body[field].trim().length < userPassLength[field].min);
            const tooLong = Object.keys(userPassLength).find(field => 'max' in userPassLength[field] && req.body[field].trim().length > userPassLength[field].max);

            if (tooShort || tooLong) {
                return res.status(422).json({
                  code: 422,
                  reason: 'ValidationError',
                  message: tooShort
                    ? `is required to be at least ${userPassLength[tooShort]
                      .min} characters long`
                    : `Cannot be greater than ${userPassLength[tooLong]
                      .max} characters long`,
                  location: tooShort || tooLong
                });
              }

            let {id, password} = req.body;

            return userInfoModel.find({id})
            .then(id => {
                if(!id) {
                    return Promise.reject({
                        code: 422,
                        reason: 'ValidationError',
                        message: 'User does not exist',
                        location: 'id'
                      });  
                }

                return userInfoModel.hashPass(password);
            })
            
            .then(hash => {

                let passUpdate = hash;

                userInfoModel.findByIdAndUpdate(req.params.id, {$set: {password: passUpdate}})
            })
            
            .then(() => res.status(204).end()

//                res.status(201).json(data.cleanUp());
                // return res.status(200).json({"message": "this is a placeholder"})
            )

       .catch(err => {
           if (err.reason === 'ERROR') {
               return res.status(err.code).json(err);
           }
           console.error(err)
           res.status(500).json({"error message": 'something is broken'});
       })
    }
*/

})



module.exports = router;