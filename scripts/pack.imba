var fs = require 'fs'
var path = require 'path'



# export def build o = {}
# 	var parser = require('./grammar.js')[:parser]
# 	fs.writeFile "{__dirname}/parser.js", parser.generate
# 
# export def dist o = {}
var lib = "{__dirname}/../lib"

var dest = path.normalize("{lib}/browser/")
# var writer = fs.createWriteStream("{dest}/main.js")
var browserify = require 'browserify'
var uglify = require 'uglifyify'

var lib = browserify(basedir: "{lib}/imba", standalone: "imba")
lib.add('./browser.js')
lib.bundle().pipe(fs.createWriteStream("{dest}/imba.js"))

var min = browserify(basedir: "{lib}/imba", standalone: "imba")
min.add('./browser.js')
min.transform({ sourcemap: false },'uglifyify')
min.bundle().pipe(fs.createWriteStream("{dest}/imba.min.js"))

var b = browserify(basedir: "{lib}/compiler", standalone: "Imbac")
b.add('./index.js')
b.bundle().pipe(fs.createWriteStream("{dest}/imbac.js"))

var bmin = browserify(basedir: "{lib}/compiler", standalone: "Imbac")
bmin.add('./index.js')
bmin.transform({ sourcemap: false },'uglifyify')
bmin.bundle().pipe(fs.createWriteStream("{dest}/imbac.min.js"))
