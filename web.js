var express = require("express");
var fs = require("fs");
var url = require("url");

var app = express();
app.use(express.logger());
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    // var pathname = url.parse(request.url).pathname;
    // response.render("html/" + pathname + ".html");
    // var buffer=fs.readFileSync("public/" + pathname);
    var buffer=fs.readFileSync("public/html/index.html");
    response.send(buffer.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log("Listening on " + port);
});