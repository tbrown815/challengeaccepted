"use-strict";

const {Strategy: LocalStrategy} = require('passport-local');

const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const {userInfoModel} = require('../models');

const {JWT_SECRET} = require('../config');

const localStrategy = new LocalStrategy((username, password, callback) => {

    let user;

    userInfoModel.findOne({username: username})
    .then(_user => {
        user = _user;
        if (!user) {
            return Promise.reject({
                reason: 'ERROR',
                message: 'Unable to authorize access'
            });
        }
        return user.valPass(password);
    })
    .then(isValid => {
        if (!isValid) {
            return Promise.reject({
                reason: 'ERROR',
                message: 'Unable to authorize access'
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

const jwtStrategy = new JwtStrategy(
    {secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        algorithms: ['HS256']
    },
    (payload, done) => {
        done(null, payload.user);
    }
);

module.exports = {localStrategy, jwtStrategy};