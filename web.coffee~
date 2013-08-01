var express = require("express");
var fs = require("fs");
var url = require("url");

var app = express();
app.use(express.logger());
app.use(express.static(__dirname + '/public'));

var publicFiles = [
    "about",
    "home",
    "contact",
    "projects",
    "raytracer"
];

var simpleRender = function(request, response) {
    var pathname = url.parse(request.url).pathname;
    var buffer=fs.readFileSync("public/html"+pathname+".html");
    // var buffer=fs.readFileSync("public/html/index.html");
    response.send(buffer.toString());
    // response.render("public/html/" + pathname + ".html");
};


app.get('/', function(request,response) {
    var buffer=fs.readFileSync("public/html/home.html");
    response.send(buffer.toString());
});

for (var i=0;i<publicFiles.length;i++)
{
    app.get('/'+publicFiles[i],simpleRender);
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Listening on " + port);
});