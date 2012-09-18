#channel9
==========

This is the source from this [channel 9 demo](http://channel9.msdn.com/Blogs/Interoperability/Nodejs-and-MongoDB-on-Windows-Azure).

----------------

![](https://dl.dropbox.com/u/11198966/channel9.png)

----------------

## installation

Install [Nodejs](http://nodejs.org), [GraphicsMagick](http://www.graphicsmagick.org/), and [MongoDB](http://www.mongodb.org/downloads).

```
> git clone https://github.com/aheckmann/channel9.git
> cd channel9
> npm i
```

## running

MongoDB must already be running. Specify your connection string by set the `CHANNEL9_MONGO` environment variable. If not set, the application will attempt to connect to the test database on localhost:27017.

```
> node server.js

// passing your own connection string
> CHANNEL9_MONGO=mongodb://localhost:99999 node server.js
```

## goals

Demonstrate the power of nodejs streams and their compatibility with both [child_processes](http://nodejs.org/api/child_process.html) and [MongoDB](http://www.mongodb.org/) by streaming uploads through an [express](http://expressjs.com) application, directly into [GridFS](http://www.mongodb.org/display/DOCS/GridFS) for storage, and back out of MongoDB, through a [graphicsmagick](http://www.graphicsmagick.org/) child_process with custom command line flags set, and finally piped back to an http [response](http://nodejs.org/api/http.html#http_class_http_serverresponse). This demo app was run on an Ubuntu vm created and running on [Microsoft Azure](http://www.windowsazure.com/en-us/develop/nodejs/).

```
  in
------
clients file system -> nodejs (express) application -> pipe -> gridfs


  out
------
gridfs -> pipe -> graphicsmagick -> pipe -> http response

```
