const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

database.raw('select name, calories from foods')
.then( data => {
  console.log(JSON.stringify(data.rows, null, 2));
  process.exit();
});
