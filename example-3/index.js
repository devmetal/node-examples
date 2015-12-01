'use strict';

var Buffer = require('buffer').Buffer;
var BufferStream = require('./bufferstream');
var fs = require('fs');

var buffer = new Buffer("Helló Világ", "utf8");
var stream = new BufferStream(buffer);

var output = fs.createWriteStream('output.txt');
stream.pipe(output);
