
var fs = require 'fs'
var path = require 'path'

# var imba = require '../imba'
var T = require './token'
var lexer = require './lexer'
var rewriter = require './rewriter'
export var parser = require('./parser')['parser']
var ast = require './nodes'

# Instantiate a Lexer for our use here.
export var lex = lexer.Lexer.new
export var Rewriter = rewriter.Rewriter

# The real Lexer produces a generic stream of tokens. This object provides a
# thin wrapper around it, compatible with the Jison API. We can then pass it
# directly as a "Jison lexer".

import Highlighter from './highlighter'


parser:lexer = lex.jisonBridge
parser:yy = ast # everything is exported right here now

export def tokenize code, o = {}
	try
		lex.reset
		lex.tokenize code, o
	catch err
		throw err

export def rewrite tokens, o = {}
	var rewriter = Rewriter.new
	try
		rewriter.rewrite tokens, o
	catch err
		throw err


export def parse code, o = {}
	var tokens = code isa Array ? code : tokenize(code,o)
	try
		# console.log("Tokens",tokens)
		o.@tokens = tokens
		return parser.parse tokens
	catch err
		# console.log("ERROR",err)
		# err:message = "In {o:filename}, {err:message}" if o:filename
		err:_filename = o:filename if o:filename
		throw err


export def compile code, o = {}
	var ast = parse(code,o)
	try
		return ast.compile(o)
	catch err
		err:_filename = o:filename if o:filename
		# err:message = "In {o:filename}, {err:message}" if o:filename
		throw err


export def highlight code, o = {}

	var tokens = o:tokens or tokenize(code,o)
	var ast = o:ast or parse(tokens,o)
	var hl = Highlighter.new(code,tokens,ast,o)
	return hl.process
	# try
	# 	return ast.compile(o)
	# catch err
	# 	err:_filename = o:filename if o:filename
	# 	# err:message = "In {o:filename}, {err:message}" if o:filename
	# 	throw err



export def run code, filename: null
	var main = require:main
	main:filename = process:argv[1] = (filename ? fs.realpathSync(filename) : '.')
	main:moduleCache &&= {} # removing all cache?!?

	var Module = require('module').Module
	main:paths = Module._nodeModulePaths(path.dirname(filename))

	if path.extname(main:filename) != '.imba' or require:extensions
		var content = compile(code, arguments[1])
		main._compile (content:js or content), main:filename
	else
		main._compile code, main:filename

if require:extensions
	require:extensions['.imba'] = do |mod, filename|
		var content = compile(fs.readFileSync(filename, 'utf8'), filename: filename)
		mod._compile (content:js or content), filename


