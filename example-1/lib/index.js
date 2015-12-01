'use strict';

var message = null;

exports.hello = function() {
  console.log("Hello world!");
}

exports.setMessage = function(msg) {
  message = msg;
}

exports.getMessage = function() {
  return message;
}
