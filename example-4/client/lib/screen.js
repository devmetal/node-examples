'use strict';

let Blessed      = require('blessed');
let EventEmitter = require('events');
let util         = require('util');

let messages = () => Blessed.list({
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

let input = () => Blessed.textbox({
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

function ChatScreen() {
  EventEmitter.call(this);

  this.screen = Blessed.screen({
    smartCSR: true
  });

  this.messages = messages();
  this.input = input();

  this.screen.append(this.messages);
  this.screen.append(this.input);

  this.screen.key(['q', 'C-c'], () => {
    this.emit('exit');
  });

  this.input.on('submit', () => {
    let val = this.input.value;
    this.input.clearValue();
    this.focus();
    this.render();
    this.emit('submit', val);
  });
}

ChatScreen.prototype.addMessage = function(msg){
  this.messages.unshiftItem(msg);
  this.render();
}

ChatScreen.prototype.render = function(){
  this.screen.render();
}

ChatScreen.prototype.focus = function() {
  this.input.focus();
}

util.inherits(ChatScreen, EventEmitter);

module.exports = ChatScreen;
