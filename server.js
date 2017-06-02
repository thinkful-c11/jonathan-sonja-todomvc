'use strict';

//
const express = require('express');
const { DATABASE, PORT } = require('./config');
const knex = require('knex')(DATABASE);

const app = express();

const router = require('./router');
// Add middleware and .get, .post, .put and .delete endpoints

/* Middleware to deal with CORS issues. Not secure. */
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  next();
});

/* Uses the router for the items api. */
app.use('/api/items', router);

/* Super basic endpoint to show proof of life. */
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Provided functions to run and close the server.
let server;
function runServer(database = DATABASE, port = PORT) {
  return new Promise((resolve, reject) => {
    try {
      // knex = require('knex')(database);
      server = app.listen(port, () => {
        console.info(`App listening on port ${server.address().port}`);
        resolve();
      });
    }
    catch (err) {
      console.error(`Can't start server: ${err}`);
      reject(err);
    }
  });
}

function closeServer() {
  return knex.destroy().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing servers');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => {
    console.error(`Can't start server: ${err}`);
    throw err;
  });
}

module.exports = { app, runServer, closeServer };
