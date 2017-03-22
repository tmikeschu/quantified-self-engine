
exports.seed = (knex, Promise) => {
  return knex.raw(`TRUNCATE foods RESTART IDENTITY`)
  .then(() => {
    return Promise.all([
      knex.raw(
        `INSERT INTO foods (name, calories, created_at, updated_at)
        VALUES (? , ?, ? ,?)`,
        ['Peanut Butter', 150, new Date(), new Date()]
      ),
      knex.raw(
        `INSERT INTO foods (name, calories, created_at, updated_at)
        VALUES (? , ?, ? ,?)`,
        ['Banana', 50, new Date(), new Date()]
      ),
      knex.raw(
        `INSERT INTO foods (name, calories, created_at, updated_at)
        VALUES (? , ?, ? ,?)`,
        ['Apple', 40, new Date(), new Date()]
      )
    ]);
  });
};
