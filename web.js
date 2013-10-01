// Generated by CoffeeScript 1.6.3
(function() {
  var app, assets, express, fs, http, https, options, port, redis, routes, url;

  express = require("express");

  fs = require("fs");

  url = require("url");

  assets = require('connect-assets');

  redis = require('redis');

  https = require('https');

  http = require('http');

  app = express();

  options = {
    key: fs.readFileSync('ssl/jacqueskaiser.com.key'),
    cert: fs.readFileSync('ssl/unified.crt')
  };

  http.createServer(app).listen(80);

  https.createServer(options, app).listen(443);

  app.set('views', __dirname + '/views');

  app.set('view engine', 'jade');

  app.use(express.favicon(__dirname + '/public/img/favicon.ico'));

  app.use(assets());

  app.use(express["static"](__dirname + '/public'));

  routes = {
    contact: function(req, res) {
      return res.render('contact', {
        title: 'Contact',
        subtitle: 'Get in touch',
        css: css,
        js: js
      });
    },
    about: function(req, res) {
      return res.render('about', {
        title: 'About',
        subtitle: 'Who am I?',
        css: css,
        js: js
      });
    },
    home: function(req, res) {
      return res.render('home', {
        title: 'Jacques KAISER',
        subtitle: 'Welcome to my personal website',
        css: css,
        js: js
      });
    },
    projects: function(req, res) {
      return res.render('projects', {
        title: 'Projects',
        subtitle: "There you'll find some of my web projects",
        css: css,
        js: js
      });
    },
    work: function(req, res) {
      return res.render('work', {
        title: 'Work experiences',
        subtitle: 'My work experiences along with references',
        css: css,
        js: js
      });
    },
    raytracer: function(req, res) {
      return res.render('raytracer', {
        title: '- A basic sphere tracer',
        subtitle: 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
        css: css,
        js: js,
        embed: false
      });
    },
    raytracerEmbed: function(req, res) {
      return res.render('raytracer', {
        title: '- A basic sphere tracer',
        subtitle: 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
        css: css,
        js: js,
        embed: true
      });
    },
    raymarcher: function(req, res) {
      return res.render('raymarcher', {
        title: '- A basic sphere marcher',
        subtitle: 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
        css: css,
        js: js,
        embed: false
      });
    },
    raymarcherEmbed: function(req, res) {
      return res.render('raymarcher', {
        title: '- A basic sphere marcher',
        subtitle: 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
        css: css,
        js: js,
        embed: true
      });
    },
    news: function(req, res) {
      return res.render('news', {
        title: 'News',
        subtitle: 'The blog part',
        css: css,
        js: js,
        posts: posts
      });
    },
    teaser: function(req, res) {
      return res.render('teaser', {});
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

  app.get('/teaser', routes.teaser);

  if (process.env.NAME === "dev") {
    app.use(express.logger('dev'));
  } else {
    app.use(function(err, req, res, next) {
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
  }

  port = process.env.PORT || 8080;

  app.listen(port, function() {
    return console.log("Listening on " + port);
  });

}).call(this);
