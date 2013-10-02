express = require "express"
fs = require "fs"
url = require "url"
assets = require 'connect-assets'
redis = require 'redis'
http = require 'http'
# redisURL = url.parse(process.env.REDISCLOUD_URL);
# client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
# client.auth(redisURL.auth.split(":")[1]);

# client.lrange('posts', 0 , 1,
#         (err,reply) ->
#                 posts = reply.toString())

# console.log(posts);


# posts = {
#         'post1' : 'first post! yihaa',
#         'post2' : 'second post! woohoo'
# }

app = express()

options =
  key: fs.readFileSync('ssl/jacqueskaiser.com.key'),
  cert: fs.readFileSync('ssl/unified2.crt')


app.set('port', process.env.PORT || 8080);
app.set('env', process.env.NAME || 'prod');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use express.logger app.get 'env'
app.use express.favicon __dirname + '/public/img/favicon.ico'
app.use assets()
app.use express.static __dirname + '/public'




# /*
#  * our routes
#  */
routes =
    contact : (req, res) -> res.render('contact',
            title : 'Contact',
            subtitle : 'Get in touch',
            css : css,
            js : js),
    about : (req, res) -> res.render('about',
            title : 'About',
            subtitle : 'Who am I?',
            css : css,
            js : js),
    home : (req, res) -> res.render('home',
            title : 'Jacques KAISER',
            subtitle : 'Welcome to my personal website',
            css : css,
            js : js),
    projects : (req, res) -> res.render('projects',
            title : 'Projects',
            subtitle : "There you'll find some of my web projects",
            css : css,
            js : js),
    work : (req, res) -> res.render('work',
            title : 'Work experiences',
            subtitle : 'My work experiences along with references',
            css : css,
            js : js),
    raytracer : (req, res) -> res.render('raytracer',
            title : '- A basic sphere tracer',
            subtitle : 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
            css : css,
            js : js,
            embed : false),
    raytracerEmbed : (req, res) -> res.render('raytracer',
            title : '- A basic sphere tracer',
            subtitle : 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
            css : css,
            js : js,
            embed : true),
    raymarcher : (req, res) -> res.render('raymarcher',
            title : '- A basic sphere marcher',
            subtitle : 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
            css : css,
            js : js,
            embed : false),
    raymarcherEmbed : (req, res) -> res.render('raymarcher',
            title : '- A basic sphere marcher',
            subtitle : 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
            css : css,
            js : js,
            embed : true),

    news : (req, res) -> res.render('news',
            title : 'News',
            subtitle : 'The blog part',
            css : css,
            js : js,
            posts : posts),
    teaser : (req, res) -> res.render('teaser',{})


app.get '/', routes.home
app.get '/contact', routes.contact
app.get '/about', routes.about
app.get '/raytracer', routes.raytracer
app.get '/raytracerEmbed', routes.raytracerEmbed
app.get '/raymarcher', routes.raymarcher
app.get '/raymarcherEmbed', routes.raymarcherEmbed
app.get '/projects', routes.projects
app.get '/work', routes.work
# app.get '/news', routes.news
app.get '/teaser', routes.teaser

if app.get('env') is 'development'
    app.use express.errorHandler()
else
    # handle server error middleware
    app.use (err, req, res, next) ->
        # console.error(err.stack);
        res.status(500).render('error',
            title: '500',
            subtitle: 'Server error'
        );

    # handle file not found middleware
    app.use (req, res, next) ->
        res.status(404).render('error',
            title: '404',
            subtitle: 'File not found'
        );


http.createServer(app).listen(app.get('port'), ->
    console.log('Express server listening on port ' + app.get('port')))
