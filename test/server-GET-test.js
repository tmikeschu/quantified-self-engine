require('dotenv').config();
const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');
const environment = process.env.NODE_ENV || 'test'
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {
  let dbFoods;

  before(done => {
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

  beforeEach(done => {
    const foods = fixtures.foods;
    Promise.all(
      foods.map( food => {
        return database.raw(
          `INSERT INTO foods (name, calories, created_at, updated_at)
          VALUES (?,?,?,?)`,
          [ food.name, food.calories, new Date(), new Date() ]
        );
      })
    )
    .then(() => done())
    .catch(done)
  });

  afterEach(done => {
    database.raw('TRUNCATE foods RESTART IDENTITY')
    .then(() => done())
    .catch(done);
  });

  after(() => {
    this.server.close();
  });

  describe('GET /', () => {
    it('returns the title and available routes', done => {
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
    it('returns all foods', done =>{
      const getFoods = foods => {
        const dbFoods = foods.rows;

        this.request.get('/foods', (error, response) => {
          if (error) { done(error); }

          dbFoods.map(food => food.name).forEach(name => {
            assert(response.body.includes(name));
          });
          done();
        });
      }
      database.raw('SELECT * FROM foods')
      .then(getFoods)
      .catch(done);
    });
  });

  describe('GET /foods/:id', () => {
    it('returns the specific food', done =>{
      const getFood = rows => {
        const dbFood = rows[0];
        this.request.get(`/foods/${dbFood.id}`, (error, response) => {
          if (error) { done(error); }

          const food = JSON.parse(response.body);

          const id = dbFood.id
          const name = dbFood.name;
          const calories = dbFood.calories;

          assert.equal(food.id, id);
          assert.equal(food.name, name);
          assert.equal(food.calories, calories);
          done();
        });
      }

      database.raw('SELECT * FROM foods')
      .then(foods => { return foods.rows; })
      .then(getFood)
      .catch(done);
    });

    it('returns a 404 if id not found', done => {
      const foodId = 4;

      this.request.get(`/foods/${foodId}`, (error, response) => {
        if (error) { done(error); }

        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });
});
