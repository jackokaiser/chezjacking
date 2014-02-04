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

String::capitalize = ->
    @.charAt(0).toUpperCase() + @.slice 1

app = express()


app.set('port', process.env.PORT || 8080);
app.set('env', process.env.NAME || 'prod');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use express.logger 'dev'
app.use express.favicon __dirname + '/public/img/favicon.ico'
app.use assets()
app.use express.static __dirname + '/public'
app.use express.bodyParser()


comments = [
    {
        name : 'toto'
        text : 'awesome Website'
    }
    {
        name : 'rocco'
        text : 'cool'
    }
    {
        name : 'ninja'
        text : '<3 bro'
    }
    {
        name : 'toto'
        text : 'awesome Website'
    }
    {
        name : 'rocco'
        text : 'cool'
    }
    {
        name : 'ninja'
        text : '<3 bro'
    }
]


class TrivialPageScope
    constructor : () ->
        @env = app.get 'env'
    addProperty : (key,value) ->
        @[key] = value
        return @


class StandardPageScope extends TrivialPageScope
    constructor : (@title, @subtitle) ->
        super()



# /*
#  * our routes
#  */
routes =
    comment : (req, res) -> res.render('comment',
            new StandardPageScope 'Comment', 'Say something'),
    contact : (req, res) -> res.render('contact',
            new StandardPageScope 'Contact','Get in touch'),
    about : (req, res) -> res.render('about',
            new StandardPageScope 'About','Who am I?'),
    home : (req, res) -> res.render('home',
            new StandardPageScope 'Jacques KAISER','Welcome to my personal website'
            ),
    projects : (req, res) -> res.render('projects',
            new StandardPageScope 'Projects', "There you'll find some of my web projects"
            ),
    work : (req, res) -> res.render('work',
            new StandardPageScope 'Work experiences', 'My work experiences along with references'
            ),
    australia : (req, res) -> res.render('australia',
            new StandardPageScope 'Australian Trip', '2013 - Current'),
    australiaMonth : (req, res) -> res.render('australiaDiary/'+req.params.month,
           new StandardPageScope 'Australia - '+req.params.month.capitalize(), '')
    raytracer : (req, res) -> res.render('raytracer',
            (new StandardPageScope '- A basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',false)
            ),
    raytracerEmbed : (req, res) -> res.render('raytracer',
            (new StandardPageScope '- A basic sphere tracer', 'MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',true)
            ),
    raymarcher : (req, res) -> res.render('raymarcher',
            (new StandardPageScope '- A basic sphere marcher','MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',false)
            ),
    raymarcherEmbed : (req, res) -> res.render('raymarcher',
            (new StandardPageScope '- A basic sphere marcher','MOVE mouse & press LEFT: rotate, MIDDLE: zoom, RIGHT: pan').addProperty('embed',true)
            ),
    news : (req, res) -> res.render('news',
            (new StandardPageScope 'News', 'The blog part').addProperty('posts',posts)
            ),
    # todo : error console for teaser
    teaser : (req, res) -> res.render('teaser')

routes.comment.post = (req,res) ->
    comments.push {
        name : 'newUser'
        text : req.body.comment
        }
    res.redirect '/comment'

# HTTP Get request
app.get '/', routes.home
app.get '/contact', routes.contact
app.get '/comment', routes.comment
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

# HTTP Post request
app.post '/comment', routes.comment.post


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
