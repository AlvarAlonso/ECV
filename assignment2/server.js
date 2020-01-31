
var http = require('http');

var WebSocketServer = require('websocket').server;

var clients = [];

var server = http.createServer(function(request, response){
    console.log("REQUEST: " + request.url);
    response.end("OK");
});

server.listen(9022, function(){
    console.log("server running at port: 9022");
});

wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request){
    var connection = request.accept(null, request.origin);
    console.log("new websocket user!");

    //var index = clients.push(connection) - 1;
    console.log(index);

    console.log("connection accepted");

    connection.on('message', function(message){
        if(message.type = 'utf8'){
            //do something
            var messageParsed = JSON.parse(message);
        }

        if(messageParsed.type === "position")
        {
            console.log("position message received!");
        }
    });

    connection.on('close', function(connection){
        console.log("user is gone");
    });
});