'use strict';

let net = require('net');
let fs = require('fs');
let path = require('path');

const TCP_PORT  = 81;
const HTTP_PORT = 80;

let chat = {
  messages: [],
  log:[],
  clients:[]
};

let tcpServer = net.createServer(function(c){
  console.log('Client connected');

  chat.clients.push(c);

  c.on('error', function(err){
    console.log(err.message);
  });

  c.on('close', function(){
    console.log('Client disconnected');
    let i = chat.clients.indexOf(c);
    chat.clients.splice(i,1);
  });

  c.on('data', (data) => {
    let request = JSON.parse(data);
    let user = request.usr;
    let mess = request.msg;

    chat.clients.forEach((client) => {
      client.write(JSON.stringify({
        user: user,
        msg: mess
      }));
    });
  });

  c.write(JSON.stringify({
    isServer:true,
    msg:'Welcome!'
  }));
});

tcpServer.listen(TCP_PORT, function(){
  console.log(`TCP Server Listening on ${TCP_PORT}`);
});
