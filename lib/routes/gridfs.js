var ms = require('ms')
var gm =require('gm')

// streaming out of gridfs
var gridstream = require('gridfs-stream');
var gfs = gridstream(db.db, db.base.mongo);
//
// streaming into gridfs with connect
var mongoMultipart = require('connect-multipart-gridform');
var multipart = mongoMultipart({ db: db.db, mongo: db.base.mongo })

// allowed fx
var types = 'crop rotate implode contrast colorize swirl blur charcoal emboss sepia'.split(' ');

// home page
function home (req, res) {
  // grab last 40 images
  gfs.files.find({}, {limit: 40, sort: {_id: -1}}).toArray(function (err, docs) {
    if (err) return next(err);
    res.render('index', { docs: docs })
  });
}

// display an image
function view (req, res, next) {
  var file = req.param('key') || '';
  if (!(file = file.trim())) return next();

  // stream the img from mongo to the http response
  var stream = gfs.createReadStream(file);
  stream.on('error', handleGridStreamErr(res));

  // pipe through graphicsmagick
  var img = gm(stream, file);

  img.resize(600, 450).quality(50);
  img.crop(150, 199.5, 100, 100);

  img.stream(function (err, stdout, _, cmd) {
    if (err) return next(err);
    //console.log('cmd: ', cmd);

    // http cache for 7 days
    res.set('Expires', new Date(Date.now() + ms('7d')));

    stdout.pipe(res);
  })
}

// construct an error handler for gridfs ops
function handleGridStreamErr (res) {
  return function (err) {
    if (/does not exist/.test(err)) {
      // trigger 404
      return res.req.next();
    }

    // may have written data already
    res.send(500);
    console.error(err.stack);
  }
}

// after file sucessfully uploaded into gridfs
function uploaded (req, res, next) {
  if (!req.files) return next(new Error('something went wrong'));

  var keys = Object.keys(req.files);

  // each upload must be an image
  // TODO handle more gracefully
  var ok = keys.every(function validateType (key) {
    var doc = req.files[key];

    // probably not image
    if (!/^image\//.test(doc.type)) {
      gfs.remove(doc.id, function (err) {
        if (err) return next(err);
        res.redirect('/');
      });

      return false;
    }

    return true;
  })

  // bad upload. already being handled.
  if (!ok) return;

  if (keys.length > 1) {
    // more than one file uploaded
    return res.render('upload-success.jade', { files: req.files })
  }

  var doc = req.files[keys[0]];
  doc.filename = doc.name;
  doc._id = doc.id;

  var locals = { doc: doc };

  // graphicsmagick default form settings
  types.forEach(function (fx) {
    locals[fx] = "";
  });

  res.render('play', locals)
}

// page which hosts the editor form
function play (req, res, next) {
  var file = req.param('key') || '';
  if (!(file = file.trim())) return next();

  var query = { _id: new db.base.Types.ObjectId(file) };

  gfs.files.findOne(query, function (err, doc) {
    if (err) return next(err);

    var locals = { doc: doc };

    // apply graphicsmagick settings
    types.forEach(function (fx) {
      var vals = req.param(fx);
      if ('rotate' == fx) {
        checkLimits(fx, [vals]);
      } else if ('colorize' == fx || 'crop' == fx) {
        vals || (vals = [])
      }
      locals[fx] = vals;
    });

    res.render('play', locals);
  })
}

// stream image from gridfs through graphicsmagick to the client
function edit (req, res, next) {
  var file = req.param('key') || '';
  if (!(file = file.trim())) return next();

  // add cache headers
  res.set('Expires', new Date(Date.now() + ms('7d')));

  // stream from mongodb
  var stream = gfs.createReadStream(file);
  stream.on('error', handleGridStreamErr(res));

  // pipe into graphicsmagick
  var img = gm(stream, file).resize(600, 800);

  // apply fx
  types.forEach(function (fx) {
    var val = String(req.param(fx) || '').trim();
    val = val.split(',');

    if (!val.some(hasValue)) return;
    checkLimits(fx, val);

    img[fx](num(val[0]), num(val[1]), num(val[2]), num(val[3]));
  });

  // stream from graphicsmagick to the http response
  img.stream(function (err, stdout, stderr, cmd) {
    if (err) return next(err);
    //console.log('ran: ', cmd);
    stdout.pipe(res);
  })
}

// helpers

function num (val) {
  return Number(val) || 0
}

function hasValue (item) {
  return !! item;
}

// ensure within reasonable graphicsmagick abilities
function checkLimits (fx, vals) {
  switch (fx) {
    case 'contrast':
      vals[0] = vals[0] | 0;
    case 'emboss':
      if (Number(vals[0]) > 10)
        vals[0] = 10;
      else if (Number(vals[0]) < -10)
        vals[0] = -10;
      break;
    case 'charcoal':
      if (Number(vals[0]) > 12)
        vals[0] = 12;
      if (Number(vals[0]) < -12)
        vals[0] = -12;
      break;
    case 'implode':
      if (Number(vals[0]) > 2000)
        vals[0] = 2000;
      if (Number(vals[0]) < -2000)
        vals[0] = -2000;
      break;
    case 'swirl':
      if (Number(vals[0]) > 99999)
        vals[0] = 99999;
      else if (Number(vals[0]) < -99999)
        vals[0] = -99999;
      break;
    case 'blur':
      if (vals[0]) vals[1] = 20;
      if (Number(vals[0]) > 200)
        vals[0] = 200;
      else if (Number(vals[0]) < -200)
        vals[0] = -200;
      break;
    case 'rotate':
      var v = Number(vals[0]) || 0;
      if (v > 0 && v <= 90) vals[1] = 90;
      else if (v > 90 && v <= 180) vals[1] = 180;
      else if (v > 180 && v <= 270) vals[1] = 270;
      else vals[1] = 0;
      vals[0] = 1;
      break;
  }
}

// expose
exports.home = home;
exports.upload = [multipart, uploaded];
exports.view = view;
exports.play = play;
exports.edit = edit;
