const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.title = 'Quantified Self';
app.locals.foods = [];

app.get('/', (request, response) => {
  response.render('index');
});

app.get('/api/v1/foods', (request, response) => {
  database.raw('SELECT * FROM foods')
  .then(foods => {
    response.json(foods.rows);
  })
  .catch(error => console.error(`DB problem: ${error}`));
});

app.post('/api/v1/foods', (request, response) => {
  const food = request.body.food;
  if (!food) { return response.sendStatus(400) }

  app.locals.foods.push(food);
  const foodId = app.locals.foods.length - 1;

  response.redirect(`/foods/${foodId}`);
});

app.get('/api/v1/foods/:id', (request, response) => {
  const id = request.params.id;
  const food = app.locals.foods[id];

  if (!food) { return response.sendStatus(404); }
  response.json(food);
});

app.patch('/api/v1/foods/:id', (request, response) => {
  const id = request.params.id;
  const dbFood = app.locals.foods[id];
  const requestFood = request.body.food;

  if (!dbFood) { return response.sendStatus(404) }
  if (!requestFood) { return response.sendStatus(400) }

  Object.keys(requestFood).forEach(attr => {
    dbFood[attr] = requestFood[attr]
  });
  response.redirect(`/foods/${id}`);
});

app.delete('/api/v1/foods/:id', (request, response) => {
  const id = request.params.id;
  const food = app.locals.foods[id];

  if (!food) { return response.sendStatus(404); }

  app.locals.foods[id] = null;
  response.redirect(202, '/foods');
});

app.locals.routes = app._router.stack
                      .map(layer => layer.route)
                      .filter(route => route !== undefined)
                      .map(route => route.path);

if (!module.parent) {
  app.listen(app.get('port'), () =>{
    console.log(`${app.locals.title} is running on ${app.get('port')}`);
  });
}

module.exports = app;

