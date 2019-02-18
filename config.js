'use strict';


exports.DATABASE_URL = process.env.DATABASE_URL;


exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

exports.PORT = process.env.PORT;

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE || '5d';

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN