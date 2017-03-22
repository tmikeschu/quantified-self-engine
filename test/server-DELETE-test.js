require('dotenv').config();
const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');
const environment = process.env.NODE_ENV || 'test'
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {
  before(done => {
    this.port = process.env.TEST_PORT;
    this.server = app.listen(this.port, (err, result) => {
      if (err) { done(err) }
      done();
    });

    this.request = request.defaults({
      baseUrl: `http://localhost:${process.env.TEST_PORT}/api/v1`
    });
  });

  beforeEach(done => {
    const foods = fixtures.foods;
    Promise.all(
      foods.map(food => {
        return database.raw(
          `INSERT INTO foods (name, calories, created_at, updated_at)
           VALUES (?,?,?,?)`,
           [ food.name, food.calories, new Date(), new Date() ]
        );
      })
    )
    .then(() => done())
    .catch(done);
  });

  afterEach(done => {
    database.raw('TRUNCATE foods RESTART IDENTITY')
    .then(() => done())
    .catch(done);
  });

  after(() => {
    this.server.close();
  });

  describe('DELETE /foods/:id', () => {
    it('returns a 404 if id is not found', done => {
      const foodId = 4;
      this.request.delete(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 404);
        done();
      });
    });

    it('deletes a food in the foods collection', done => {
      const deleteFood = foods => {
        const dbFood = foods.rows[0];

        this.request.delete(`/foods/${dbFood.id}`, (error, response) => {
          if (error) { done(error); }

          assert.equal(
            response.body, 'Accepted. Redirecting to /foods',
            `Expected body to say "Accepted. Redirecting to /foods", but got ${response.body}`
          );
          database.raw('SELECT * FROM foods')
          .then(foods => assert.equal(foods.rows.length, 2))
          .catch(done);
          done();
        });
      };

      database.raw('SELECT * FROM foods')
      .then(deleteFood)
      .catch(done)
    });

    it('redirects to /foods with a 202 status', done => {
      const deleteFood = foods => {
        const dbFood = foods.rows[0];

        this.request.delete(`/foods/${dbFood.id}`, (error, response) => {
          if (error) { done(error); }

          const newPath = response.headers.location;
          assert.equal(
            newPath, `/foods`,
            `Expected to be on "/foods", but got "${newPath}"`
          );
          assert.equal(
            response.statusCode, 202,
            `Expected status code to be 202, but got "${response.statusCode}"`
          );
          done();
        });
      };

      database.raw('SELECT * FROM foods')
      .then(deleteFood)
      .catch(done)
    });
  });
});
