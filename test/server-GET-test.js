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

    this.rootRequest = request.defaults({
      baseUrl: `http://localhost:${process.env.TEST_PORT}`
    });
  });

  after(() => {
    this.server.close();
  });

  describe('GET /', () => {
    it('returns the title and available routes', (done) => {
      const routes = app._router.stack
                      .map(layer => layer.route)
                      .filter(route => route !== undefined)
                      .map(route => route.path);

      this.rootRequest.get('/', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        assert(
          response.body.includes(app.locals.title),
          `${app.locals.title} not found.`
        );
        routes.forEach(route => response.body.includes(route));
        done();
      });
    });
  });

  describe('GET /foods', () => {
    beforeEach(() => {
      app.locals.foods = fixtures.foods
    });

    it('returns all foods', (done) =>{
      const foods = app.locals.foods;

      this.request.get('/foods', (error, response) => {
        if (error) { done(error); }
        assert(
          response.body.includes(JSON.stringify(foods)),
          `${JSON.stringify(foods)} not found in ${response.body}`
        );
        done();
      });
    });
  });

  describe('GET /foods/:id', () => {
    let foods;

    beforeEach(() => {
      foods = fixtures.foods;
      app.locals.foods = foods;
    });

    it('returns the specific food', (done) =>{
      const food = foods.filter((food) => food !== null)[0];
      const foodId = foods.indexOf(food);

      this.request.get(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        assert(
          response.body.includes(JSON.stringify(food)),
          `${JSON.stringify(food)} not found in ${response.body}`
        );
        done();
      });
    });

    it('returns a 404 if id not found', (done) => {
      const foodId = 3;

      this.request.get(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });
});
