'use strict';

let Socket = require('net').Socket;
let EventEmitter = require('events');
let util = require('util');
let commander = require('commander');
let Blessed = require('blessed');

const DEFAULT_PORT = 81;
const DEFAULT_HOST = 'localhost';

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

commander
  .arguments('<username>')
  .option('-p, --port <port>', 'Server port')
  .option('--host <host>', 'Server hostname')
  .action(function(uname){
    let screen = Blessed.screen({
      smartCSR: true
    });

    let messages = Blessed.list({
      top: 0,
      left: 0,
      width: '100%',
      height: '90%',
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'magenta',
        border: {
          fg: '#f0f0f0'
        }
      }
    });

    let input = Blessed.textbox({
      bottom:0,
      left:0,
      width: '100%',
      height: '10%',
      inputOnFocus: true,
      style: {
          fg: 'white',
          bg: 'red'
      }
    });

    screen.title = uname;
    screen.append(messages);
    screen.append(input);

    let port = commander.port || DEFAULT_PORT;
    let host = commander.host || DEFAULT_HOST;
    let chat = new Chat(port, host, uname);

    chat.on('connected', () => {
      input.focus();

      input.on('submit', () => {
        let val = input.value;
        chat.send(val);
        input.clearValue();
        input.focus();
      });

      screen.render();
    });

    chat.on('server', (message) => {
      messages.unshiftItem(`SERVER: ${message.msg}`);
      screen.render();
    });

    chat.on('message', (message) => {
      if (message.user === chat.user) {
          messages.unshiftItem(`You: ${message.msg}`);
      } else {
          messages.unshiftItem(`${message.user}: ${message.msg}`);
      }
      screen.render();
    });

    chat.on('error', () => {
      console.log('Something wrong!');
      process.exit(1);
    });

    screen.key(['q', 'C-c'], function(ch, key) {
      chat.leave(() => process.exit(0));
    });
  })
  .parse(process.argv);
