var fs = require 'fs'
var path = require 'path'



export def build o = {}
	var parser = require('./grammar.js')[:parser]
	fs.writeFile "{__dirname}/parser.js", parser.generate

export def dist o = {}
	var dest = path.normalize("{__dirname}/../browser/")
	# var writer = fs.createWriteStream("{dest}/main.js")
	var browserify = require 'browserify'

	var b = browserify(basedir: "{__dirname}/../imba", standalone: "imba")
	b.add('./browser.js')
	b.bundle().pipe(fs.createWriteStream("{dest}/imba.js"))

	var b = browserify(basedir: "{__dirname}/", standalone: "imbalang")
	b.add('./index.js')
	b.bundle().pipe(fs.createWriteStream("{dest}/compiler.js"))
