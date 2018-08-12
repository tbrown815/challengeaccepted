"use-strict";

const express = require('express');

const bodyParser = require('body-parser');

const passport = require('passport');

const jwt = require('jsonwebtoken');

const {userInfoModel} = require('../models')

const config = require('../config');

const router = express.Router();

//*
const genJWT = function(user) {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRE,
        algorithm: 'HS256'
    });
};

const auth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());


//  /login
router.post('/', auth, (req, res) => {
    const token = genJWT(req.user.cleanUp());
    res.json({token});
});

const authJWT = passport.authenticate('jwt', {session: false});

//  /login/refresh
router.post('/refresh', authJWT, (req, res) => {
    const token = genJWT(req.user);
    res.json({token});
});


module.exports = router;