'use strict';

/* 
 * The router for the items API endpoints connecting to the 
 * specified database and performing CRUD operations in the items table.
 * The functionality in this RESTful API was driven by the unit tests
 * provided in test/test-server.js.
 */

const express = require('express');
const router = express.Router();

const { DATABASE, PORT } = require('./config');
const bodyParser = require('body-parser');
const knex = require('knex')(DATABASE);

const json = bodyParser.json();


/* A function to create the URL for an item in the database.
 * Takes a protocol, host, and id and returns a string URL.
 * This is a function due to the repeated need for it.
*/
function createURL(protocol, host, id){
  return `${protocol}://${host}/api/items/${id}`;
}

/*************************** GET ENDPOINTS ****************************/

/* 
 * An endpoint to get all the items from the item table, appending
 * a URL at which the item can be viewed to each one and returns
 * it as JSON. 
 */
router.get('/', (req, res) => {
  knex('items')
  .then(result => {
    result.forEach(element => {
      element.url = createURL(req.protocol, req.get('host'), element.id);
    });
    res.json(result);
  });

/* 
 * An endpoint to get an item from the item table that corresponds
 * to the item id specified in the URL and returns it as JSON. 
 */  

});
router.get('/:id', (req, res) => {
  knex('items')
  .where('id', req.params.id)
  .then(result => {
    res.json(result[0]);
  });
  // res.json( [] );
});

/*************************** POST ENDPOINT ****************************/

/* An endpoint to create a new item in the item table if a title is 
 * provided. If there is no title provided the function returns an error.
 * The post returns the added, but uncompleted, item along with the 
 * URL to access it. 
 */

router.post('/',json, (req, res) => {
  if(!req.body.title){
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

/*************************** PUT ENDPOINT ****************************/

/*
 * An endpoint to update an item specified by an id in the URL.
 * This currently checks for title or completed updates, returning
 * an error if neither one is provided. 
 */
router.put('/:id', json, (req, res) => {
  if(!(req.body.title || req.body.completed)){
    res.status(400).send();
  }
  else{
    const value = Object.keys(req.body)[0];
    knex('items')
      .update(req.body)
      .where('id', req.params.id)
      .returning(value)
      .then(result => {
        const obj = {};
        obj[value] = result[0];
        res.json(obj);
      });
  }
});

/***************************DELETE ENDPOINT****************************/

/*
 * An endpoint to delete an item specified by id. Returns nothing. 
 */

router.delete('/:id', json, (req, res) => {
  knex('items')
  .where('id', req.params.id)
  .del()
  .then(result => res.json(result));
});




module.exports = router;
