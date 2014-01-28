// Generated by CoffeeScript 1.6.3
(function() {
  var StandardPageScope, TrivialPageScope, app, assets, express, fs, http, redis, routes, url,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  express = require("express");

  fs = require("fs");

  url = require("url");

  assets = require('connect-assets');

  redis = require('redis');

  http = require('http');

  app = express();

  app.set('port', process.env.PORT || 8080);

  app.set('env', process.env.NAME || 'prod');

  app.set('views', __dirname + '/views');

  app.set('view engine', 'jade');

  app.use(express.logger('dev'));

  app.use(express.favicon(__dirname + '/public/img/favicon.ico'));

  app.use(assets());

  app.use(express["static"](__dirname + '/public'));

  Object.prototype.addProperty = function(key, value) {
    console.log('toto');
  };

  TrivialPageScope = (function() {
    function TrivialPageScope() {
      this.env = app.get('env');
    }

    TrivialPageScope.prototype.addProperty = function(key, value) {
      this[key] = value;
      return this;
    };

    return TrivialPageScope;

  })();

  StandardPageScope = (function(_super) {
    __extends(StandardPageScope, _super);

    function StandardPageScope(title, subtitle) {
      this.title = title;
      this.subtitle = subtitle;
      StandardPageScope.__super__.constructor.call(this);
    }

    return StandardPageScope;

  })(TrivialPageScope);

  routes = {
    contact: function(req, res) {
      return res.render('contact', new StandardPageScope('Contact', 'Get in touch'));
    },
    about: function(req, res) {
      return res.render('about', new StandardPageScope('About', 'Who am I?'));
    },
    home: function(req, res) {
      return res.render('home', new StandardPageScope('Jacques KAISER', 'Welcome to my personal website'));
    },
    projects: function(req, res) {
      return res.render('projects', new StandardPageScope('Projects', "There you'll find some of my web projects"));
    },
    work: function(req, res) {
      return res.render('work', new StandardPageScope('Work experiences', 'My work experiences along with references'));
    },
    australia: function(req, res) {
      return res.render('australia', new StandardPageScope('Australian Trip', '2013 - Current'));
    },
    raytracer: function(req, res) {
      return res.render('raytracer', (new StandardPageScope('- A basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan')).addProperty('embed', false));
    },
    raytracerEmbed: function(req, res) {
      return res.render('raytracer', (new StandardPageScope('- A basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan')).addProperty('embed', true));
    },
    raymarcher: function(req, res) {
      return res.render('raymarcher', (new StandardPageScope('- A basic sphere marcher', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan')).addProperty('embed', false));
    },
    raymarcherEmbed: function(req, res) {
      return res.render('raymarcher', (new StandardPageScope('- A basic sphere marcher', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan')).addProperty('embed', true));
    },
    news: function(req, res) {
      return res.render('news', (new StandardPageScope('News', 'The blog part')).addProperty('posts', posts));
    },
    teaser: function(req, res) {
      return res.render('teaser');
    }
  };

  app.get('/', routes.home);

  app.get('/contact', routes.contact);

  app.get('/about', routes.about);

  app.get('/raytracer', routes.raytracer);

  app.get('/raytracerEmbed', routes.raytracerEmbed);

  app.get('/raymarcher', routes.raymarcher);

  app.get('/raymarcherEmbed', routes.raymarcherEmbed);

  app.get('/projects', routes.projects);

  app.get('/work', routes.work);

  app.get('/australia', routes.australia);

  app.get('/teaser', routes.teaser);

  app.use(express.errorHandler());

  app.use(function(err, req, res, next) {
    console.error(err.stack);
    return res.status(500).render('error', {
      title: '500',
      subtitle: 'Server error'
    });
  });

  app.use(function(req, res, next) {
    return res.status(404).render('error', {
      title: '404',
      subtitle: 'File not found'
    });
  });

  http.createServer(app).listen(app.get('port'), function() {
    return console.log('Express server listening on port ' + app.get('port'));
  });

}).call(this);
