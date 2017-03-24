const app = require('./routes');

if (!module.parent || !module.parent.id.includes('test')) {
  app.listen(app.get('port'), () =>{
    console.log(`${app.locals.title} is running on ${app.get('port')}`);
  });
}

module.exports = app;
