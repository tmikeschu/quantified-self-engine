class HomeController {
  index(request, response) {
    response.render('index');
  }
}

module.exports = new HomeController();
