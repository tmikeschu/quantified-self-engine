const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

create = food => {
  return database.raw(
    `INSERT INTO foods (name, calories, created_at, updated_at)
    VALUES (?,?,?,?)`,
    [ food.name, food.calories, new Date(), new Date() ]
  );
}

all = () => database.raw('SELECT * FROM foods');

clear = () => database.raw('TRUNCATE foods RESTART IDENTITY');

find = id => database.raw('SELECT * FROM foods WHERE id = ?', [id])

update = (data, food) => {
  return database.raw(
    `UPDATE foods SET name = ?, calories = ?, updated_at = ? WHERE id = ?`,
    [
      data.name || food.name, data.calories || food.calories,
      new Date(), food.id
    ]
  )
}

destroy = id => database.raw('DELETE FROM foods where id = ?', [id]);

module.exports = {
  create: create,
  all: all,
  clear: clear,
  find: find,
  update: update,
  destroy: destroy,
}
