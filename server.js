
var mongoose = require('mongoose')

var connStr = process.env.CHANNEL9_MONGO || 'mongodb://localhost/test'

// expose db connection
global.db = mongoose.createConnection(connStr);

// show connection errors in the console
db.on('error', console.error.bind(console, 'mongo: error:'));

// start up http server once connected to mongo
db.once('open', function () {
  //console.log('mongo: open');

  // our express server
  var app = require('./lib/app');

  var port = 3000;
  app.listen(port, function () {
    console.log('now listening on http://localhost:%d', port);
  })
})

