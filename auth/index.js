'use-strict';

const { router } = require('./authRouter');

const { localStrategy, jwtStrategy } = require('./authStrat');

module.exports = { router, localStrategy, jwtStrategy };

