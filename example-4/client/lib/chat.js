'use strict';

let Socket       = require('net').Socket;
let EventEmitter = require('events');
let util         = require('util');

function Chat(port, host, user) {
  EventEmitter.call(this);

  this.user = user;
  this.socket = new Socket({
    allowHalfOpen:true
  });

  this.socket.connect(port, host, () => {
    this.emit('connected');
  });

  this.socket.on('data', (data) => {
    let message = JSON.parse(data);
    if (message.isServer) {
      this.emit('server', message);
    } else {
      this.emit('message', message);
    }
  });

  this.socket.on('error', (err) => {
    this.socket.destroy();
    this.emit('error', err);
  });
};

Chat.prototype.send = function(msg, cb) {
  let message = JSON.stringify({
    usr: this.user,
    msg: msg
  });
  this.socket.write(message, cb || null);
};

Chat.prototype.leave = function(cb) {
  this.socket.destroy();
  if (typeof cb === 'function') {
    cb();
  }
};

util.inherits(Chat, EventEmitter);

module.exports = Chat;
