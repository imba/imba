# everything should be moved to this file instead
var fs = require 'fs'
var path = require 'path'

var compiler  = require './compiler'
var parser = compiler:parser

export def tokenize code, o = {}
	compiler.tokenize(code,o)

export def rewrite code, o = {}
	compiler.rewrite(code,o)

export def parse code, o
	compiler.parse(code,o)

export def compile code, o = {}
	compiler.compile(code,o)

export def analyze code, o = {}
	compiler.analyze(code,o)

export def run code, filename: null
	# console.log 'run code via run in index',filename
	var main = require:main
	main:filename = process:argv[1] = (filename ? fs.realpathSync(filename) : '.')
	main:moduleCache &&= {} # removing all cache?!?

	var Module = require('module').Module
	main:paths = Module._nodeModulePaths(path.dirname(filename))

	if path.extname(main:filename) != '.imba' or require:extensions
		var content = compiler.compile(code, arguments[1])
		main._compile (content:js or content), main:filename
	else
		main._compile code, main:filename

if require:extensions
	require:extensions['.imba'] = do |mod, filename|
		# console.log 'run code via require extensions in index',filename
		var content = compiler.compile(fs.readFileSync(filename, 'utf8'), filename: filename)
		mod._compile (content:js or content), filename
