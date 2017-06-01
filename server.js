'use strict';

const express = require('express');
const { DATABASE, PORT } = require('./config');
const bodyParser = require('body-parser');
const knex = require('knex')(DATABASE);

const app = express();
const json = bodyParser.json();
// Add middleware and .get, .post, .put and .delete endpoints

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/items', (req, res) => {
  knex('items')
  .then(result => res.json(result));
  // res.json( [] );
});
app.get('/api/items/:id', (req, res) => {
  knex('items')
  .where('id', req.params.id)
  .then(result => res.json(result[0]));
  // res.json( [] );
});

app.post('/api/items',json, (req, res) => {
  if(!req.body.title){
    console.log('Are we here?');
    res.status(400).send();
  }else {
    knex('items')
    .insert({title: req.body.title})
    .returning(['id','title'])
    .then(response => {
      res.status(201)
      .location(`/api/items/${response}`)
      .json(response[0]);
    });
  }
});

let server;
// let knex;
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
