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

  describe('PATCH /foods/:id', () => {
    const allFoods = database.raw('SELECT * FROM foods');

    it('returns a 400 if no data is sent', done => {
      const foodId = 1;

      this.request.patch(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 400);
        done();
      });
    });

    it('returns a 404 if id is not found', done => {
      const foodId = 4;
      const foodUpdate = { name: 'Avocado' };

      this.request.patch(`/foods/${foodId}`, { form: { food: foodUpdate } }, (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 404);
        done();
      });
    });

    it('updates a food\'s name in foods collection', done => {
      const patchFood = foods => {
        const dbFood = foods.rows[0];
        const foodUpdate = { name: 'Avocado' };

        this.request.patch(`/foods/${dbFood.id}`, { form: { food: foodUpdate } }, (error, response) => {
          if (error) { done(error); }

          allFoods.then(foods => {
            const updatedFood = foods.rows.find(food => food.id == dbFood.id);
            const newName = updatedFood.name;

            assert.equal(
              foodUpdate.name, newName,
              `Expected ${newName} to be ${foodUpdate.name}`
            );
          });
          done();
        });
      }
      allFoods.then(patchFood)
      .catch(done);
    });

    it('updates a food\'s calories in foods collection', done => {
      const patchFood = foods => {
        const dbFood = foods.rows[0];
        const foodUpdate = { calories: '1000' };

        this.request.patch(`/foods/${dbFood.id}`, { form: { food: foodUpdate } }, (error, response) => {
          if (error) { done(error); }

          allFoods.then(foods => {
            const updatedFood = foods.rows.find(food => food.id == dbFood.id);
            const newCalories = updatedFood.calories;

            assert.equal(
              foodUpdate.calories, newCalories,
              `Expected ${newCalories} to be ${foodUpdate.calories}`
            );
          })
          done();
        });
      }
      allFoods.then(patchFood)
      .catch(done);
    });

    it('updates a food\'s name and calories in foods collection', done => {
      const patchFood = foods => { const dbFood = foods.rows[0];
        const foodUpdate = { name: 'Avocado', calories: '150' };

        this.request.patch(`/foods/${dbFood.id}`, { form: { food: foodUpdate } }, (error, response) => {
          if (error) { done(error); }

          allFoods.then(foods => {
            const updatedFood = foods.rows.find(food => food.id == dbFood.id);
            const newName = updatedFood.name;
            const newCalories = updatedFood.calories;

            assert.equal(
              foodUpdate.name, newName,
              `Expected ${newName} to be ${foodUpdate.name}`
            );

            assert.equal(
              foodUpdate.calories, newCalories,
              `Expected ${newCalories} to be ${foodUpdate.calories}`
            );
          })
          done();
        });
      }
      allFoods.then(patchFood)
      .catch(done);
    });

    it('redirects to /foods/:id', done => {
      const patchFood = foods => { const dbFood = foods.rows[0];
        const foodUpdate = { name: 'Avocado', calories: '150' };

        this.request.patch(`/foods/${dbFood.id}`, { form: { food: foodUpdate } }, (error, response) => {
          if (error) { done(error); }
          const newPath = response.headers.location;

          assert.equal(
            newPath,
            `/foods/${dbFood.id}`,
            `Expected to be on "/foods/${dbFood.id}", but got "${newPath}"`
          );
          done();
        });
      }
      allFoods.then(patchFood)
      .catch(done);
    });
  });
});
