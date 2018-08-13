//Use strict
"use strict";

//exports DATABASE_URL equals process env DATABASE_URL || 'mongodb://databaseURL/dbName...';
    //For dev environment may need to swap positions - 'mongodb://databaseURL/dbName...' || process env DATABASE_URL
//exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/blog-app';

exports.DATABASE_URL = 'mongodb://localhost/challengeaccepted' || process.env.DATABASE_URL;

//exports TEST_DATABASE_URL equals process env TEST_DATABASE_URL || 'mongodb://databaseURL/test_dbName...';
exports.TEST_DATABASE_URL = 'mongodb://localhost/test-challengeaccepted' || process.env.TEST_DATABASE_URL;

//exports PORT equals process env PORT || <portNum>;
exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = 'STELLA_THE_DESTROYER_OF_TOYS' || process.env.JWT_SECRET;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE || '5d';