"use-strict";

const { Strategy: LocalStrategy } = require('passport-local');

//const LocalStrategy = require('passport-local');

//const {JwtStrategy, ExtractJwt} = require('passport-jwt');

//const TokenModel = require('passport-jwt');
//const ExtractJwt = require('passport-jwt');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const {userInfoModel} = require('../models')

const JWT_SECRET = require('../config');

const authModel = new LocalStrategy((username, password, callback) => {
    let user;

    userInfoModel.findOne({username: username})
    .then(_user => {
    
        user = _user;

        if (!user) {

            return Promise.reject({
                reason: 'ERROR',
                message: 'unable to authorize access'
            });
        }
        return user.valPass(password);
    })
    .then(valid => {
        if(!valid) {
            return Promise.reject({
                reason: 'ERROR',
                message: 'unable to authorize access'
            });
        }
        return callback(null, user);
    })
    .catch(err => {
        if (err.reason === 'ERROR') {
            return callback(null, false, err);
        }
        return callback(err, false);
    });
});

const jwtModel = new JwtStrategy({

    secretOrKey: JWT_SECRET,
   // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    jwtFromRequest :ExtractJwt.fromAuthHeaderAsBearerToken('Bearer'),
    algorithms: ['HS256']
    },
    (payload, done) => {
        done(null, payload.user)
    }
);

module.exports = {authModel, jwtModel};


//module.exports = {authModel};
