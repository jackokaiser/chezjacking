express = require "express"
fs = require "fs"
url = require "url"
assets = require "connect-assets"

redis = require 'redis'
redisURL = url.parse(process.env.REDISCLOUD_URL);
client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

client.set('foo', 'bar');
client.get('foo',  (err, reply) ->
    console.log(reply.toString()));



app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use express.favicon __dirname + '/public/img/favicon.ico'
app.use express.logger()
app.use express.static __dirname + '/public'
app.use assets({
        src: "public"
        })



# /*
#  * our routes
#  */
routes = {
        contact : (req, res) -> res.render('contact',
                {
                        title : 'Contact',
                        subtitle : 'Get in touch',
                }),
        about : (req, res) -> res.render('about',
                {
                        title : 'About',
                        subtitle : 'Who am I?'
                }),
        home : (req, res) -> res.render('home',
                {
                        title : 'Jacques KAISER',
                        subtitle : 'Welcome to my personal website',
                }),
        projects : (req, res) -> res.render('projects',
                {
                        title : 'Projects',
                        subtitle : "There you'll find some of my web projects",
                }),
        work : (req, res) -> res.render('work',
                {
                        title : 'Work experiences',
                        subtitle : 'My work experiences along with references',
                }),
        raytracer : (req, res) -> res.render('raytracer',
                {
                        title : '- A basic sphere tracer',
                        subtitle : 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan',
                })
}

app.get '/', routes.home
app.get '/home', routes.home
app.get '/contact', routes.contact
app.get '/about', routes.about
app.get '/raytracer', routes.raytracer
app.get '/projects', routes.projects
app.get '/work', routes.work

port = process.env.PORT || 8080

app.listen port, ->
        console.log("Listening on " + port);
