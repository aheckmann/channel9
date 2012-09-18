var gridfs = require('./gridfs')
var errors = require('./errors')

module.exports = exports = function (app) {
  app.use(app.router);
  errors(app)
  routes(app)
}

function routes (app) {
  app.get('/', gridfs.home);
  app.post('/', gridfs.upload);
  app.get('/image/:key', gridfs.view);
  app.get('/play/:key', gridfs.play);
  app.get('/edit/:key', gridfs.edit);
}

