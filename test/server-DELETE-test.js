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
      baseUrl: `http://localhost:${process.env.TEST_PORT}/api/v1`
    });
  });

  after(() => {
    this.server.close();
    app.locals.foods = fixtures.foods;
  });

  describe('DELETE /foods/:id', () => {
    let foods;

    beforeEach(() => {
      foods = fixtures.foods;
      app.locals.foods = require('./fixtures').foods;
    });

    it('returns a 404 if id is not found', (done) => {
      const foodId = 4;

      this.request.delete(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 404);
        done();
      });
    });

    it('deletes a food in the foods collection', (done) => {
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);
      const foodsBefore = app.locals.foods.filter(food => food !== null).length;

      this.request.delete(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        const foodsAfter = app.locals.foods.filter(food => food !== null).length;
        const foodsDifference = foodsBefore - foodsAfter;
        assert.equal(
          foodsDifference, 1,
          `Expected count to decrease by 1, but got ${foodsDifference}`
        );

        const deletedFood = app.locals.foods[foodId];
        assert.equal(
          deletedFood, null,
          `Expected index ${foodId} to return null, but got ${deletedFood}`
        );
        done();
      });
    });

    it('redirects to /foods with a 202 status', (done) => {
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);

      this.request.delete(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        const newPath = response.headers.location;

        assert.equal(
          newPath,
          `/foods`,
          `Expected to be on "/foods", but got "${newPath}"`
        );

        assert.equal(
          response.statusCode,
          202,
          `Expected status code to be 202, but got "${response.statusCode}"`
        );
        done();
      });
    });
  });
});
