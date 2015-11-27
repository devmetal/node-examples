'use strict';

let commander  = require('commander');
let Chat       = require('./lib/chat');
let ChatScreen = require('./lib/screen');

const DEFAULT_PORT = 81;
const DEFAULT_HOST = 'localhost';

commander
  .arguments('<username>')
  .option('-p, --port <port>', 'Server port')
  .option('--host <host>', 'Server hostname')
  .action(function(uname){

    let port = commander.port || DEFAULT_PORT;
    let host = commander.host || DEFAULT_HOST;
    let chat = new Chat(port, host, uname);
    let screen = new ChatScreen();

    chat.on('connected', () => {
      screen.on('submit', (val) => {
        chat.send(val);
      });
      screen.focus();
      screen.render();
    });

    chat.on('server', (message) => {
      screen.addMessage(`SERVER: ${message.msg}`);
    });

    chat.on('message', (message) => {
      if (message.user === chat.user) {
          screen.addMessage(`You: ${message.msg}`);
      } else {
          screen.addMessage(`${message.user}: ${message.msg}`);
      }
    });

    chat.on('error', () => {
      console.log('Something wrong!');
      process.exit(1);
    });

    screen.on('exit', () => {
      chat.leave();
      process.exit(0);
    });

    screen.render();

  })
  .parse(process.argv);
