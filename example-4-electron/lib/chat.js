'use strict';

let Socket       = require('net').Socket;
let EventEmitter = require('events');
let util         = require('util');

function Chat() {
  EventEmitter.call(this);

  this.socket = new Socket({
    allowHalfOpen:true
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

Chat.prototype = Object.create(EventEmitter.prototype);
Chat.prototype.constructor = Chat;

Chat.prototype.join = function(port, host, user) {
  this.user = user;
  this.socket.connect(port, host, () => {
    this.emit('connected');
  });
}

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

module.exports = Chat;
