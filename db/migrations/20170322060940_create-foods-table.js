exports.up = function(knex, Promise) {
  const createQuery = `
    CREATE TABLE foods(
      id SERIAL PRIMARY KEY NOT NULL,
      name TEXT,
      calories INTEGER,
      created_at TIMESTAMP,
      updated_at TIMESTAMP
    )
  `;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  const dropQuery = `DROP TABLE foods`;
  return knex.raw(dropQuery);
};
