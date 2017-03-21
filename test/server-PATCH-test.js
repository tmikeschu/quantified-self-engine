require('dotenv').config();
const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Server', () => {
  before((done) => {
    this.port = process.env.TEST_PORT;
    this.server = app.listen(this.port, (err, result) => {
      if (err) { done(err) }
      done();
    });

    this.request = request.defaults({
      baseUrl: `http://localhost:${process.env.TEST_PORT}`
    });
  });

  after(() => {
    this.server.close();
  });

  describe('PATCH /foods/:id', () => {
    let foods;

    beforeEach(() => {
      foods = fixtures.foods;
      app.locals.foods = foods;
    });

    it('returns a 400 if no data is sent', (done) => {
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);

      this.request.patch(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 400);
        done();
      });
    });

    it('returns a 404 if id is not found', (done) => {
      const foodId = 4;

      this.request.patch(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 404);
        done();
      });
    });

    it('updates a food\'s name in foods collection', (done) => {
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);
      const foodUpdate = { name: 'Avocado' };

      this.request.patch(`/foods/${foodId}`, { form: { food: foodUpdate } }, (error, response) => {
        if (error) { done(error); }
        const newName = app.locals.foods[foodId].name

        assert.equal(
          foodUpdate.name, newName,
          `Expected ${newName} to be ${foodUpdate.name}`
        );
        done();
      });
    });

    it('updates a food\'s calories in foods collection', (done) => {
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);
      const foodUpdate = { calories: '1000' };

      this.request.patch(`/foods/${foodId}`, { form: { food: foodUpdate } }, (error, response) => {
        if (error) { done(error); }
        const newCalories = app.locals.foods[foodId].calories

        assert.equal(
          foodUpdate.calories, newCalories,
          `Expected ${newCalories} to be ${foodUpdate.calories}`
        );
        done();
      });
    });

    it('updates a food\'s name and calories in foods collection', (done) => {
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);
      const foodUpdate = { name: 'Avocado', calories: '150' };

      this.request.patch(`/foods/${foodId}`, { form: { food: foodUpdate } }, (error, response) => {
        if (error) { done(error); }
        const newName = app.locals.foods[foodId].name
        const newCalories = app.locals.foods[foodId].calories

        assert.equal(
          foodUpdate.name, newName,
          `Expected ${newName} to be ${foodUpdate.name}`
        );

        assert.equal(
          foodUpdate.calories, newCalories,
          `Expected ${newCalories} to be ${foodUpdate.calories}`
        );
        done();
      });
    });

    it('redirects to /foods/:id', (done) => {
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);
      const foodUpdate = { name: 'Avocado', calories: '150' };

      this.request.patch(`/foods/${foodId}`, { form: { food: foodUpdate } }, (error, response) => {
        if (error) { done(error); }
        const newPath = response.headers.location;

        assert.equal(
          newPath,
          `/foods/${foodId}`,
          `Expected to be on "/foods/${foodId}", but got "${newPath}"`
        );
        done();
      });
    });
  });
});
