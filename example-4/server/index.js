'use strict';

let net = require('net');
let http = require('http');
let fs = require('fs');
let path = require('path');

const TCP_PORT  = 81;
const HTTP_PORT = 80;

let chat = {
  connections: 0,
  messages: [],
  log:[]
};

let tcpServer = net.createServer(function(c){
  chat.connections++;

  console.log('Client connected');
  console.log(`${c.remoteAddress}:${c.remotePort}`);

  c.on('close', () => {
    console.log('Client disconnected');
    console.log(`${c.remoteAddress}:${c.remotePort}`);
  });

  c.on('data', (data) => {
    let message = JSON.parse(data);
    let user = message.user;
    let msg = message.msg;

    chat.log.push(message);

    if (msg !== 'echo') {
      chat.messages.unshift({user:user, msg:msg});

      if (chat.messages.length > 5) {
        chat.messages = chat.messages.slice(0,5);
      }
    }

    c.write(JSON.stringify(chat.messages));
  });
});

let httpServer = http.createServer(function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(chat));
});

tcpServer.listen(TCP_PORT, function(){
  console.log(`TCP Server Listening on ${TCP_PORT}`);
});

httpServer.listen(HTTP_PORT, function(){
  console.log(`HTTP Server Listening on ${HTTP_PORT}`);
});
