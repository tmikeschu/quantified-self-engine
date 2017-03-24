const app = require('./config');
const FoodsController = require('./controllers/foods_controller');
const HomeController = require('./controllers/home_controller');
const RouteLister = require('./lib/helpers/list-routes');

// Home Controller
app.get('/', HomeController.index);

// Foods Controller
app.get('/api/v1/foods', FoodsController.index);
app.post('/api/v1/foods', FoodsController.create);
app.get('/api/v1/foods/:id', FoodsController.show);
app.patch('/api/v1/foods/:id', FoodsController.patch);
app.delete('/api/v1/foods/:id', FoodsController.destroy);

app.locals.routes = RouteLister.listRoutes(app);

module.exports = app;
