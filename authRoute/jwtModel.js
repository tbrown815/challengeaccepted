//AT THIS TIME THIS IS NOT USED


/*


"use-strict";

//const authModel = require('passport-local');

const userInfoModel = require('../models')

const {TokenModel, ExtractJwt} = require('passport-jwt');

const JWT_SECRET = require('../config');

const jwtModel = new TokenModel({

    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
    },
    (payload, done) => {
        done(null, payload.user)
    }
);

module.exports = {jwtModel};



*/