var fs = require('fs');
var parser = require('../build/grammar.js').parser
fs.writeFileSync(__dirname + "/../build/parser.js", parser.generate());

