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

function createURL(protocol, host, id){
  return `${protocol}://${host}/api/items/${id}`;
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/items', (req, res) => {
  knex('items')
  .then(result => {
    //console.log(result);
    result.forEach(element => {
      element.url = createURL(req.protocol, req.get('host'), element.id);
    });
    console.log(result);
    //const url = {url: createURL(req.protocol, req.hostname, result[0].id)};
    //const array = [url];

    //console.log(returnObj);
    res.json(result);
  });

});
app.get('/api/items/:id', (req, res) => {
  knex('items')
  .where('id', req.params.id)
  .then(result => {
    res.json(result[0]);
  });
  // res.json( [] );
});

app.post('/api/items',json, (req, res) => {
  if(!req.body.title){
    //console.log('Are we here?');
    console.log('Hey');
    res.status(400).send();
  }else {
    knex('items')
    .insert({title: req.body.title})
    .returning(['id','title', 'completed'])
    .then(response => {
      const protocol = req.protocol;
      const host = req.get('host');
      const url = createURL(protocol, host, response[0].id);
      const returnObj = {
        url: url,
        id: response[0].id,
        title:response[0].title,
        completed:response[0].completed };
      res.status(201).location(url)
      .json(returnObj);
    });
  }
});

app.put('/api/items/:id', json, (req, res) => {
  if(req.body !== {}){
    //console.log('Are we here?');
    console.log('Hey');
    res.status(400).send();
  }
  else{
    if(req.body.completed){
      knex('items')
      .update('completed', req.body.completed)
      .where('id', req.params.id)
      .returning('completed')
      .then(result => res.json({completed:result[0]}));

    }
    else{
      knex('items')
      .update('title', req.body.title)
      .where('id', req.params.id)
      .returning('title')
      .then(result => res.json({title:result[0]}));
    }
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
