'use strict';

const express = require('express');
const router = express.Router();

const { DATABASE, PORT } = require('./config');
const bodyParser = require('body-parser');
const knex = require('knex')(DATABASE);

const json = bodyParser.json();

function createURL(protocol, host, id){
  return `${protocol}://${host}/api/items/${id}`;
}



router.get('/', (req, res) => {
  knex('items')
  .then(result => {
    result.forEach(element => {
      element.url = createURL(req.protocol, req.get('host'), element.id);
    });
    res.json(result);
  });

});
router.get('/:id', (req, res) => {
  knex('items')
  .where('id', req.params.id)
  .then(result => {
    res.json(result[0]);
  });
  // res.json( [] );
});

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

router.delete('/:id', json, (req, res) => {
  knex('items')
  .where('id', req.params.id)
  .del()
  .then(result => res.json(result));
});




module.exports = router;
