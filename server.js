//Use strict
"use strict";

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

//const {exerStatsModel, userInfoModel} = require('./models')

const {userInfoModel} = require('./models');

//const {router: userRoute} = require('./users')

const userRoute = require('./users/userRoute')

const siteRoute = require('./site/siteRoute')


const {router: authRoute, localStrategy, jwtStrategy} = require('./auth');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config')

const app = express();

//app.use(express.json());

app.use(morgan('common'));

app.use('/public', express.static(__dirname + 'public'));
app.use('/clientSite', express.static(__dirname + 'clientSite'));

//app.use('/clientSite', express.static('siteRoute'));
//app.use('/user', express.static('userRoute'));


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });


passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/site', siteRoute);


/*
const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get('/users/protected', jwtAuth, (req, res) => {
    return res.json({
        data: 'rosebud'
    })

});
*/
//catch-all endpoint
app.use('*', function(req,res) {
  res.status(404).json("There was an error, please try again - EP does not exist");
});


//Server Start
let server;

function startServer(databaseUrl, port=PORT)    {
    return new Promise((resolve, reject) =>   {

        mongoose.connect(databaseUrl, err => {
            if(err){
                return reject(err);
            }
            
                server = app.listen(port, () => {
                    console.log(`server is using port ${port}`);
                resolve();  
                })

            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });    
        });
    });
            
};


//Server Stop
function stopServer()   {

    return mongoose.disconnect().then(() => {

        return new Promise((resolve, reject) => {
            console.log('server being stopped');
            server.close(err => {
                if(err) {
                   return reject(err);
                }

                resolve();
            });
        });
    });
};


if (require.main === module) {
    startServer(DATABASE_URL).catch(err => {console.error(err)
    })

};


module.exports = {app, startServer, stopServer};