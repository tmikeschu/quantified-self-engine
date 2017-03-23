const app = require('express')();
const cors = require('cors');
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const bodyParser = require('body-parser');
const path = require('path');
const RouteLister = require('./lib/helpers/list-routes');
const FoodsController = require('./controllers/foods_controller');
const HomeController = require('./controllers/home_controller');

app.options('*', cors(corsOptions))

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions))

app.locals.title = 'Quantified Self';

// Home Controller
app.get('/', HomeController.index);

// Foods Controller
app.get('/api/v1/foods', FoodsController.index);
app.post('/api/v1/foods', FoodsController.create);
app.get('/api/v1/foods/:id', FoodsController.show);
app.patch('/api/v1/foods/:id', FoodsController.patch);
app.delete('/api/v1/foods/:id', FoodsController.destroy);
if (!module.parent) {
  app.listen(app.get('port'), () =>{
    console.log(`${app.locals.title} is running on ${app.get('port')}`);
  });
}

app.locals.routes = RouteLister.listRoutes(app);
module.exports = app;
