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
  let message = JOSN.stringify({
    usr: this.user,
    msg: msg
  });
  this.socket.write(message, cb || null);
};

Chat.prototype.leave = function() {
  this.socket.end();
};

util.inherits(Chat, EventEmitter);

commander
  .arguments('<username>')
  .option('-p, --port <port>', 'Server port')
  .option('--host <host>', 'Server hostname')
  .action(function(uname){
    let screen = Blessed.screen({
      // Example of optional settings:
      smartCSR: true,
      useBCE: true,
      cursor: {
          artificial: true,
          blink: true,
          shape: 'underline'
      },
      log: `${__dirname}/application.log`,
      debug: true,
      dockBorders: true
    });

    let messages = Blessed.list({
      top: 'center',
      left: '0%',
      width: '50%',
      height: '100%',
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'magenta',
        border: {
          fg: '#f0f0f0'
        },
        hover: {
          bg: 'green'
        }
      }
    });

    let form = Blessed.form({
      top: 'center',
      left: '50%',
      width: '50%',
      height: '100%',
      border: {
        type: 'line'
      }
    });

    let input = Blessed.textarea();
    form.append(input);

    // Specify the title of the application.
    screen.title = uname;
    screen.append(messages);
    screen.append(form);

    let port = commander.port || DEFAULT_PORT;
    let host = commander.host || DEFAULT_HOST;
    let chat = new Chat(port, host, uname);

    chat.on('connected', () => {
      input.focus();
      form.on('submit', () => {
        chat.send(input.value, () => {
          input.clearValue();
        });
      });
      screen.render();
      screen.key(['q', 'C-c'], function(ch, key) {
          process.exit(0);
      });
    });

    chat.on('server', (message) => {
      messages.unshiftItem(`SERVER:${message.msg}`);
    });

    chat.on('message', (message) => {
      messages.unshiftItem(`${message.user}:${message.msg}`);
    });

    chat.on('error', () => {
      console.log('Something wrong!');
      process.exit(1);
    });

    process.on('beforeExit', () => chat.leave());
  })
  .parse(process.argv);
