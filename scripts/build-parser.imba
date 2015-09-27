var fs = require 'fs'
var parser = require('../lib/compiler/grammar.js')[:parser]
fs.writeFile "{__dirname}/../lib/compiler/parser.js", parser.generate