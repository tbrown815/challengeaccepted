//Use strict
"use strict";

let DB_URL;
let DB_TEST_URL

function checkEnv() {
    
        let envHost = window.location.hostname;
    let envName = envHost.search('heroku');
    
    //Prod config
    if (envName > 1) {
        DB_URL = process.env.DATABASE_URL;
    }
    //Local config
    else {
        DB_URL = 'mongodb://localhost/challengeaccepted';
    };
};

function checkTestEnv() {
    
    let envHost = window.location.hostname;
let envName = envHost.search('heroku');

//Prod config
if (envName > 1) {
    DB_TEST_URL = process.env.TEST_DATABASE_URL;
}
//Local config
else {
    DB_TEST_URL = 'mongodb://localhost/test-challengeaccepted';
};
};

//exports DATABASE_URL equals process env DATABASE_URL || 'mongodb://databaseURL/dbName...';
    //For dev environment may need to swap positions - 'mongodb://databaseURL/dbName...' || process env DATABASE_URL
//exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/blog-app';

//exports.DATABASE_URL = 'mongodb://localhost/challengeaccepted';
exports.DATABASE_URL = DB_URL;

//exports TEST_DATABASE_URL equals process env TEST_DATABASE_URL || 'mongodb://databaseURL/test_dbName...';
exports.TEST_DATABASE_URL = DB_TEST_URL; // 'mongodb://localhost/test-challengeaccepted' || 

//exports PORT equals process env PORT || <portNum>;
exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE || '5d';



function determineEnv() {
    checkEnv();
    checkTestEnv();
};


$(determineEnv);