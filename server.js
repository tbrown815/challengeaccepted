//Use strict
"use strict";

//Create a constant to import(require) express
const express = require('express');

//Create a constant to import(require) mongoose
const mongoose = require('mongoose');
//Create a constant to import/require morgan for logging
const morgan = require('morgan');

//mongoose Promise equals global ES6 Promises
mongoose.Promise = global.Promise;
//Create const of PORT, DATABASE_URL to import(require) config.js
const {PORT, DATABASE_URL} = require('./config')
//create const of Primary {modelName}  OR {modelName1, modelName2} to require models file
const {exerStatsModel, userInfoModel} = require('./models')

//Create const of Secondary {modelName} to import(require) models.js

//const {userInfoModel} = require('./models')

//Create constant that creates a new app instance by calling top level express function
const app = express();

//tell app to use express.json
app.use(express.json());

//tell app to use morgan for common logging
app.use(morgan('common'));

//tell app to use express static folder public
app.use(express.static('public'));
//app.use('/site', express.static('siteRoute'));
//app.use('/user', express.static('userRoute'));

//Create const for new `constNameRoute` (can name it anything) to import(require) routeFile.js (can name it anything) *duplicate for multiple route files
const siteRoute = require('./siteRoute');

const userRoute = require('./userRoute');

//tell app to use args of '/endPointName' and const specified for 'constNameRoute' *duplicate for multiple route files
app.use('/site', siteRoute);

app.use('/users', userRoute);


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
