require('dotenv').config();
const assert = require('assert');
const request = require('request');
const app = require('../server');

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

  describe('POST /foods', () => {
    it('returns a 400 if no data is sent', (done) => {
      this.request.post('/foods', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 400);
        done();
      });
    });

    it('adds a food to the foods collection', (done) => {
      const food = { name: 'Avocado', calories: '150' };
      const foodsCountBefore = Object.keys(app.locals.foods).length;

      this.request.post('/foods', { form: { food: food } }, (error, response) => {
        if (error) { done(error); }
        const foodsCountAfter = Object.keys(app.locals.foods).length;
        const foodsCountDifference = foodsCountAfter - foodsCountBefore;

        assert.equal(
          foodsCountDifference,
          1,
          `Expected difference to be 1, got ${foodsCountDifference}`
        );
        done();
      });
    });

    it('redirects to /foods/:id', (done) => {
      const food = { name: 'Avocado', calories: '150' };

      this.request.post('/foods', { form: { food: food } }, (error, response) => {
        if (error) { done(error); }
        const newPath = response.headers.location;
        const foodId = app.locals.foods.length - 1;

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
