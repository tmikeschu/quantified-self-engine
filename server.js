const app = require('express')();
const bodyParser = require('body-parser');
const path = require('path');
const FoodsController = require('./controllers/foods_controller');
const HomeController = require('./controllers/home_controller');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.title = 'Quantified Self';

// Home Controller
app.get('/', HomeController.index);

// Foods Controller
app.get('/api/v1/foods', FoodsController.index);
app.post('/api/v1/foods', FoodsController.create);
app.get('/api/v1/foods/:id', FoodsController.show);
app.patch('/api/v1/foods/:id', FoodsController.patch);
app.delete('/api/v1/foods/:id', FoodsController.delete);

app.locals.routes = app._router.stack
  .map(layer => layer.route)
  .filter(route => route !== undefined)
  .map(route => {
    const verb = Object.keys(route.methods)[0]
    return `${verb.toUpperCase()} - ${route.path}`
  });

if (!module.parent) {
  app.listen(app.get('port'), () =>{
    console.log(`${app.locals.title} is running on ${app.get('port')}`);
  });
}

module.exports = app;

