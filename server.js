


//app.listen(process.env.PORT || 8080);



//Use strict
"use strict";

//Create a constant to import(require) express
const express = require('express');

//Create a constant to import(require) mongoose

//Create a constant to import/require morgan for logging
const morgan = require('morgan');

//mongoose Promise to use global ES6 Promises

//Create const of PORT, DATABASE_URL to import(require) config.js

//create const of Primary {modelName}  OR {modelName1, modelName2} to require models file

//Create const of Secondary {modelName} to import(require) models.js
//const {blogModel} = require('./models');

//Create constant that creates a new app instance by calling top level express function
const app = express();

//tell app to use express.json
//app.use(express.json());

//tell app to use express static folder public
app.use(express.static('public'));

//tell app to use morgan for common logging
app.use(morgan('common'));


let server;

function startServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve(server);
        })
        .on("error", err => {
          reject(err);
        });
    });
  }

  function stopServer() {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          reject(err);
          // so we don't also call `resolve()`
          return;
        }
        resolve();
      });
    });
  }

  if (require.main === module) {
    startServer().catch(err => console.error(err));
  }
  
  module.exports = { app, startServer, stopServer };


app.get('/', (req, res) => {
    res.status(200);
})
