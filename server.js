//Use strict
"use strict";

require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const {exerStatsModel, userInfoModel} = require('./models')

const {authModel, jwtModel} = require('./authRoute/authModels')

//const {authModel} = require('./authRoute/authModels')
//const {jwtModel} = require('./authRoute/jwtModel')

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config')


const app = express();

app.use(express.json());

app.use(morgan('common'));

app.use(express.static('public'));
//app.use('/site', express.static('siteRoute'));
//app.use('/user', express.static('userRoute'));

passport.use(authModel);
passport.use(jwtModel);

const siteRoute = require('../siteRoute');

const userRoute = require('../userRoute');

const authRoute = require('../authRoute')

app.use('/site', siteRoute);

app.use('/users', userRoute);

app.use('/login', authRoute);


//catch-all endpoint
app.use('*', function(req,res) {
  res.status(404).json("Thee was an error, please try again");
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

/*
app.get('/', (req, res) => {
    
  res.status(200);
})
*/
