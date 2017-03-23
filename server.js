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

  database.raw(
    `INSERT INTO foods (name, calories, created_at, updated_at)
    VALUES (?,?,?,?)`,
    [ food.name, food.calories, new Date(), new Date() ]
  )
  .then((foods) => {
    database.raw('SELECT * FROM foods')
    .then(foods => {
      const newFood = foods.rows[foods.rows.length - 1];
      response.redirect(`/foods/${newFood.id}`);
    })
    .catch(error => console.error(`DB problem: ${error}`));
  })
  .catch(error => console.error(`DB problem: ${error}`));
});

app.get('/api/v1/foods/:id', (request, response) => {
  database.raw('SELECT * FROM foods WHERE id=?', [request.params.id])
  .then(foods => {
    const food = foods.rows[0];
    if (!food) { return response.sendStatus(404); }
    response.json(foods.rows[0]);
  })
  .catch(error => console.error(`DB problem: ${error}`));
});

app.patch('/api/v1/foods/:id', (request, response) => {
  const id = request.params.id;
  const requestFood = request.body.food;
  if (!requestFood) { return response.sendStatus(400) }

  database.raw('SELECT * FROM foods WHERE id = ?', [id])
  .then(foods => {
    food = foods.rows[0];
    if (!food) { return response.sendStatus(404); }

    database.raw(
      `UPDATE foods
      SET name = ?, calories = ?, updated_at = ?
      WHERE id = ?`,
      [
        requestFood.name || food.name,
        requestFood.calories || food.calories,
        new Date(),
        id
      ]
    )
    .then((stuff) => {
      response.redirect(`/foods/${id}`);
    })
    .catch(error => console.error(error));
  })
  .catch(error => console.error(`DB problem: ${error}`));
});

app.delete('/api/v1/foods/:id', (request, response) => {
  const id = request.params.id;
  let food;

  database.raw('SELECT * FROM foods WHERE id = ?', [id])
  .then(foods => {
    food = foods.rows[0];
    if (!food) { return response.sendStatus(404); }
    database.raw('DELETE FROM foods where id = ?', [id])
    .then(() => {
      response.redirect(202, '/foods');
    })
    .catch(error => console.error(error));
  })
  .catch(error => console.error(`DB problem: ${error}`));
});

app.locals.routes = app._router.stack
                      .map(layer => layer.route)
                      .filter(route => route !== undefined)
                      .map(route => {
                        const verb = Object.keys(route.methods)[0]
                        return `${verb.toUpperCase()} - ${route.path}`
                      });

if (!module.parent) {
  app.listen(app.get('port'), () =>{
    console.log(`${app.locals.title} is running on ${app.get('port')}`);
  });
}

module.exports = app;

