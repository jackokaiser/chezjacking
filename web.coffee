express = require "express"
fs = require "fs"
url = require "url"
assets = require "connect-assets"


redis = require('redis');
redisURL = url.parse(process.env.REDISCLOUD_URL);
client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

client.set('foo', 'bar');
client.get('foo',  (err, reply) ->
    console.log(reply.toString()));



app = express()
app.use express.logger()
app.use express.static __dirname + '/public'
app.use assets({
        src: "public"
        })

publicFiles = [
        "about",
        "home",
        "contact",
        "projects",
        "work",
        "raytracer"
]

simpleRender = (request, response) ->
        pathname = (url.parse request.url).pathname
        buffer = fs.readFileSync "html"+pathname+".html"
        # buffer = fs.readFileSync "public/html/index.html"
        response.send buffer.toString()
        # response.render("public/html/" + pathname + ".html");


app.get '/' , (request,response) ->
        buffer=fs.readFileSync "html/home.html"
        response.send buffer.toString()


app.get '/'+file, simpleRender for file in publicFiles

port = process.env.PORT || 8080

app.listen port, ->
        console.log("Listening on " + port);
