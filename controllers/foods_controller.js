const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

class FoodsController {
  index(request, response) {
    database.raw('SELECT * FROM foods')
    .then(foods => {
      response.json(foods.rows);
    })
    .catch(error => console.error(`DB problem: ${error}`));
  }

  create(request, response) {
    const food = request.body.food;
    const dbFoods = database.raw('SELECT * FROM foods');
    if (!food) { return response.sendStatus(400) }

    database.raw(
      `INSERT INTO foods (name, calories, created_at, updated_at)
      VALUES (?,?,?,?)`,
      [ food.name, food.calories, new Date(), new Date() ]
    )
    .then((foods) => {
      dbFoods.then(foods => {
        const newFood = foods.rows[foods.rows.length - 1];
        response.redirect(`/foods/${newFood.id}`);
      })
      .catch(error => console.error(`DB problem: ${error}`));
    })
    .catch(error => console.error(`DB problem: ${error}`));
  }

  show(request, response) {
    database.raw('SELECT * FROM foods WHERE id=?', [request.params.id])
    .then(foods => {
      const food = foods.rows[0];
      if (!food) { return response.sendStatus(404); }
      response.json(foods.rows[0]);
    })
    .catch(error => console.error(`DB problem: ${error}`));
  }

  patch(request, response) {
    const id = request.params.id;
    const requestFood = request.body.food;
    if (!requestFood) { return response.sendStatus(400) }

    database.raw('SELECT * FROM foods WHERE id = ?', [id])
    .then(foods => {
      const food = foods.rows[0];
      if (!foods.rows[0]) { return response.sendStatus(404); }

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
      .then(() => {
        response.redirect(`/foods/${id}`);
      })
      .catch(error => console.error(error));
    })
    .catch(error => console.error(`DB problem: ${error}`));
  }

  delete(request, response) {
    const id = request.params.id;

    database.raw('SELECT * FROM foods WHERE id = ?', [id])
    .then(foods => {
      const food = foods.rows[0];
      if (!food) { return response.sendStatus(404); }
      database.raw('DELETE FROM foods where id = ?', [id])
      .then(() => {
        response.redirect(202, '/foods');
      })
      .catch(error => console.error(error));
    })
    .catch(error => console.error(`DB problem: ${error}`));
    }
}

module.exports = new FoodsController();
