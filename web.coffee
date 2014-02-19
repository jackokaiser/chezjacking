express = require "express"
fs = require "fs"
url = require "url"
assets = require 'connect-assets'
redis = require 'redis'
http = require 'http'
{routes} = require './routes'

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

String::capitalize = ->
    @.charAt(0).toUpperCase() + @.slice 1

app = express()


app.set('port', process.env.PORT || 8080);
app.set('env', process.env.NAME || 'prod');
routes.setEnvironment(app.get('env'))
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use express.logger 'dev'
app.use express.favicon __dirname + '/public/img/favicon.ico'
app.use assets()
app.use express.static __dirname + '/public'


app.get '/', routes.home
app.get '/contact', routes.contact
app.get '/about', routes.about
app.get '/raytracer', routes.raytracer
app.get '/raytracerEmbed', routes.raytracerEmbed
app.get '/raymarcher', routes.raymarcher
app.get '/raymarcherEmbed', routes.raymarcherEmbed
app.get '/projects', routes.projects
app.get '/work', routes.work
app.get '/australia', routes.australia
app.get '/australia/:month', routes.australiaMonth
# app.get '/news', routes.news
app.get '/teaser', routes.teaser

app.use express.errorHandler()
# handle server error middleware
app.use (err, req, res, next) ->
    console.error(err.stack);
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
