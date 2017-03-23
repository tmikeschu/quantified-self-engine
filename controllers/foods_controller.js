const Food = require('../lib/models/food');

index = (request, response) => {
  Food.all()
  .then(foods =>  response.json(foods.rows))
  .catch(error => console.error(`DB problem: ${error}`));
}

create = (request, response) => {
  const food = request.body.food;
  if (!food) { return response.sendStatus(400) }

  Food.create(food)
  .then((foods) => {
    Food.all().then(foods => {
      const newFood = foods.rows[foods.rows.length - 1];
      response.redirect(`/foods/${newFood.id}`);
    })
    .catch(error => console.error(`DB problem: ${error}`));
  })
  .catch(error => console.error(`DB problem: ${error}`));
}

show = (request, response) => {
  Food.find(request.params.id)
  .then(foods => {
    const food = foods.rows[0];
    if (!food) { return response.sendStatus(404); }
    response.json(foods.rows[0]);
  })
  .catch(error => console.error(`DB problem: ${error}`));
}

patch = (request, response) => {
  const id = request.params.id;
  const data = request.body.food;
  if (!data) { return response.sendStatus(400) }

  Food.find(id).then(foods => {
    const food = foods.rows[0];
    if (!foods.rows[0]) { return response.sendStatus(404); }

    Food.update(data, food)
    .then(() => {
      response.redirect(`/foods/${id}`);
    })
    .catch(error => console.error(error));
  })
  .catch(error => console.error(`DB problem: ${error}`));
}

destroy = (request, response) => {
  const id = request.params.id;

  Food.find(id).then(foods => {
    const food = foods.rows[0];
    if (!food) { return response.sendStatus(404); }
    Food.destroy(id)
    .then(() => {
      response.redirect(202, '/foods');
    })
    .catch(error => console.error(error));
  })
  .catch(error => console.error(`DB problem: ${error}`));
}

module.exports = {
  index: index,
  show: show,
  create: create,
  patch: patch,
  destroy: destroy,
};
