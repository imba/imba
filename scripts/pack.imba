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

var imba = browserify(basedir: "{lib}/imba", standalone: "imba")
imba.add('./browser.js')
imba.bundle().pipe(fs.createWriteStream("{dest}/imba.js"))

var imbamin = browserify(basedir: "{lib}/imba", standalone: "imba")
imbamin.add('./browser.js')
imbamin.transform({ sourcemap: false },'uglifyify')
imbamin.bundle().pipe(fs.createWriteStream("{dest}/imba.min.js"))

var imbac = browserify(basedir: "{lib}/compiler", standalone: "Imbac")
imbac.add('./index.js')
imbac.bundle().pipe(fs.createWriteStream("{dest}/imbac.js"))

var imbacmin = browserify(basedir: "{lib}/compiler", standalone: "Imbac")
imbacmin.add('./index.js')
imbacmin.transform({ sourcemap: false },'uglifyify')
imbacmin.bundle().pipe(fs.createWriteStream("{dest}/imbac.min.js"))
