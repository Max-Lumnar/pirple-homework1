/*
* Homework Assignment #1
* @Author: Max Lumnar
* @Description: simple API that listens to port 5080 and replies to hello
*/

//Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

//Config
var httpPort = 5080;

//create the http server
var httpServer = http.createServer(function (req, res) { 

       //get url and parse it
       var parsedURL = url.parse(req.url,true);
    
       //get the path and clean it
       var path = parsedURL.pathname;
       var trimmedPath = path.replace(/^\/+|\/+$/g, '');
     
       //get the payload if any, decode it and store in buffer
       var decoder = new StringDecoder('utf-8');
       var buffer = '';
       req.on('data', function (data) {
           buffer += decoder.write(data);
       });
   
       req.on('end', function () {
           buffer += decoder.end(); //finish the buffer loading
   
           //chose the handler based on the path
           var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
          
           //construct the data object to send to handler
           var data = {
               'path': trimmedPath,
               'payload': buffer
           };
          
           chosenHandler(data, function (statusCode, payload) {
               //use the status code called back by handler or default to 200
               statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
               
               //use payload called back by the handler or default to empty onject
               payload = typeof (payload) == 'object' ? payload : {};
   
               //convert the payload we are sending back, to a string
               var payloadString = JSON.stringify(payload);
   
               //return the response
               res.setHeader('Content-Type','application/json');
               res.writeHead(statusCode);
               res.end(payloadString);      
               
               //debug
               console.log("\nReceived data: ", data);
               console.log("\nReturning this response: ", statusCode, payloadString);
           }); 
    })

});

//start http server
httpServer.listen(httpPort, function () {
    console.log("listening on HTTP port " + httpPort);
});

//define the handlers
var handlers = {};

//Ping handler
handlers.hello = function (data, callback){
    //callback a http status code and reply object
    callback(200, { 'reply': 'Hello stranger, I am here', 'received': data.payload });
};

//not found 404 handler
handlers.notFound = function (data, callback){
    callback(404);
};

//define all request routers here
var router = {
    'hello':handlers.hello
};