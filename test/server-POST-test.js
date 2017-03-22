require('dotenv').config();
const assert = require('assert');
const request = require('request');
const app = require('../server');
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

  afterEach(done => {
    database.raw('TRUNCATE foods RESTART IDENTITY')
    .then(() => done())
    .catch(done);
  });

  after(() => {
    this.server.close();
  });

  describe('POST /foods', () => {
    it('returns a 400 if no data is sent', done => {
      this.request.post('/foods', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 400);
        done();
      });
    });

    it('adds a food to the foods collection', done => {
      const createFood = foods => {
        const foodsBefore = foods.rows;
        const newFood = { name: 'Avocado', calories: '150' };

        this.request.post('/foods', { form: { food: newFood } }, (error, response) => {
          if (error) { done(error); }

          database.raw('SELECT * FROM foods')
          .then(foods => {
            const foodsAfter = foods.rows;
            const foodsChange = foodsAfter.length - foodsBefore.length;
            assert.equal(foodsChange, 1);
          })
          .catch(done);
          done();
        });
      }

      database.raw('SELECT * FROM foods')
      .then(createFood)
      .catch(done);
    });

    it('redirects to /foods/:id', done => {
      const createFood = foods => {
        const newFood = { name: 'Avocado', calories: '150' };

        this.request.post('/foods', { form: { food: newFood } }, (error, response) => {
          if (error) { done(error); }

          database.raw('SELECT * FROM foods')
          .then(foods => {
            const newPath = response.headers.location;
            const newFood = foods.rows[foods.rows.length - 1]

            assert.equal(
              newPath,
              `/foods/${newFood.id}`,
              `Expected to be on "/foods/${newFood.id}", but got "${newPath}"`
            );
          })
          .catch(done);
          done();
        });
      }

      database.raw('SELECT * FROM foods')
      .then(createFood)
      .catch(done);
    });
  });
});
