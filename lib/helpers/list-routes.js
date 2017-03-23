listRoutes = app => {
  return app._router.stack
    .map(layer => layer.route)
    .filter(route => route !== undefined)
    .map(route => {
      const verb = Object.keys(route.methods)[0]
      return `${verb.toUpperCase()} - ${route.path}`
    });
}

module.exports = {
  listRoutes: listRoutes,
}
