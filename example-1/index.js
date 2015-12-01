'use strict';

var lib = require('./lib');
var Person = require('./person');

lib.hello();
lib.setMessage('My Name is Adam');
console.log(lib.getMessage());

var p = new Person('Bela');
console.log(p.name);

p.name = "Laci";
console.log(p.name);
