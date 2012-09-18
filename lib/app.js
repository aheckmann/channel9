var express = require('express')
var app = module.exports = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.static(__dirname + '/../public'), { maxAge: 3600 }); // 1 hour
app.use(express.logger('dev'));

// add routes
require('./routes')(app);
