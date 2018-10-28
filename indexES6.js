/*
* Homework Assignment #1 ES6 version
* @Author: Max Lumnar
* @Description: simple API that listens to port 5080 and replies to hello
*/

//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

//Config
const httpPort = 5080;

//create the http server
const httpServer = http.createServer((req, res) => { 

       //get url and parse it
       let parsedURL = url.parse(req.url,true);
    
       //get the path and clean it
       let path = parsedURL.pathname;
       let trimmedPath = path.replace(/^\/+|\/+$/g, '');
     
       //get the payload if any, decode it and store in buffer
       let decoder = new StringDecoder('utf-8');
       let buffer = '';
       req.on('data', (data) => {
           buffer += decoder.write(data);
       });
   
       req.on('end', () => {
           buffer += decoder.end(); //finish the buffer loading
   
           //chose the handler based on the path
           let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
          
           //construct the data object to send to handler
           let data = {
               'path': trimmedPath,
               'payload': buffer
           };
          
           chosenHandler(data, (statusCode, payload) => {
               //use the status code called back by handler or default to 200
               statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
               
               //use payload called back by the handler or default to empty onject
               payload = typeof (payload) == 'object' ? payload : {};
   
               //convert the payload we are sending back, to a string
               let payloadString = JSON.stringify(payload);
   
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
httpServer.listen(httpPort, () => {
    console.log("listening on HTTP port " + httpPort);
});

//define the handlers
let handlers = {};

//Ping handler
handlers.hello = (data, callback) => {
    //callback a http status code and reply object
    callback(200, { 'reply': 'Hello stranger, I am here', 'received': data.payload });
};

//not found 404 handler
handlers.notFound = (data, callback) => {
    callback(404);
};

//define all request routers here
const router = {
    'hello':handlers.hello
};