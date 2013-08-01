express = require "express"
fs = require "fs"
url = require "url"

app = express()
app.use express.logger()
app.use express.static __dirname + '/public'

publicFiles = [
        "about",
        "home",
        "contact",
        "projects",
        "raytracer"
]

simpleRender = (request, response) ->
        pathname = (url.parse request.url).pathname
        buffer = fs.readFileSync "public/html"+pathname+".html"
        # buffer = fs.readFileSync "public/html/index.html"
        response.send buffer.toString()
        # response.render("public/html/" + pathname + ".html");


app.get '/' , (request,response) ->
        buffer=fs.readFileSync "public/html/home.html"
        response.send buffer.toString()


app.get '/'+file, simpleRender for file in publicFiles

port = process.env.PORT || 8080

app.listen port, ->
        console.log("Listening on " + port);
