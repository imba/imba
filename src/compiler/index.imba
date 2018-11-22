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
	var main = require:main
	main:filename = process:argv[1] = (filename ? fs.realpathSync(filename) : '.')
	main:moduleCache &&= {}

	var Module = require('module').Module
	main:paths = Module._nodeModulePaths(path.dirname(filename))

	if path.extname(main:filename) != '.imba' or require:extensions
		arguments[1][:target] ||= 'node'
		arguments[1][:standalone] ||= yes
		var content = compiler.compile(code, arguments[1])
		main._compile (content:js or content), main:filename
	else
		main._compile code, main:filename

if require:extensions
	require:extensions['.imba'] = do |mod, filename|
		var options = {filename: filename, target: 'node'}
		
		var body = fs.readFileSync(filename, 'utf8')
		var content = compile(body, options)
		return mod._compile (content:js), filename
