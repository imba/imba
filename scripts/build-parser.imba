var fs = require 'fs'
var parser = require('../lib/compiler/grammar.js')[:parser]
fs.writeFileSync("{__dirname}/../lib/compiler/parser.js", parser.generate)