
module.exports = function errors (app) {
  // 404
  // https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js
  app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
      res.render('404', { url: req.url });
      return;
    }

    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
  });

  // errors
  // https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js
  app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('oops', { error: err });
  });

}
