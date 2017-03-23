const app = require('./server');
const FoodsController = require('./controllers/foods_controller');
const HomeController = require('./controllers/home_controller');

// Home Controller
app.get('/', HomeController.index);

// Foods Controller
app.get('/api/v1/foods', FoodsController.index);
app.post('/api/v1/foods', FoodsController.create);
app.get('/api/v1/foods/:id', FoodsController.show);
app.patch('/api/v1/foods/:id', FoodsController.patch);
app.delete('/api/v1/foods/:id', FoodsController.destroy);

module.exports = app;
