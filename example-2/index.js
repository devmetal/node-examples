'use strict';

var http = require('http');

var server = http.createServer(function(req,res){
  res.statusCode = 200;
  res.setHeader('Content-Type', "text/html; charset='utf8'");
  res.end("<h1>Hello World!</h1>");
});

server.listen(8080, function(){
  console.log('server listening');
});
