const app = require('express')();
const bodyParser = require('body-parser');
const path = require('path');
const RouteLister = require('../lib/helpers/list-routes');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.title = 'Quantified Self';
app.locals.routes = RouteLister.listRoutes(app);

if (!module.parent) {
  app.listen(app.get('port'), () =>{
    console.log(`${app.locals.title} is running on ${app.get('port')}`);
  });
}

module.exports = app;
