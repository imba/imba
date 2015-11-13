
var fs = require 'fs'
var path = require 'path'

# var imba = require '../imba'
var T = require './token'
var ERR = require './errors'
var util = require './helpers'
var lexer = require './lexer'
var rewriter = require './rewriter'
export var parser = require('./parser')['parser']
var ast = require './nodes'

# Instantiate a Lexer for our use here.
export var lex = lexer.Lexer.new
export var Rewriter = rewriter.Rewriter

parser:lexer = lex.jisonBridge
parser:yy = ast # everything is exported right here now

export def tokenize code, o = {}
	try
		o.@source = code
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
		o.@source = code
		o.@tokens = tokens
		return parser.parse tokens
	catch err
		err:_filename = o:filename if o:filename
		throw err


export def compile code, o = {}
	try
		var tokens = tokenize(code, o)
		var ast = parse(tokens, o)
		return ast.compile(o)
	catch err
		err:_filename = o:filename if o:filename
		if tokens && err isa ERR:ImbaParseError
			try
				var tok = err.start
			catch e
				throw err

			var locmap = util.locationToLineColMap(code)
			var lines  = code.split(/\n/g)

			var lc = locmap[tok.@loc] or [0,0]
			var ln = lc[0]
			var col = lc[1]
			var line = lines[ln]

			var message = err:message + "\n\n{ln}" + "\n{ln + 1} {line}" + "\n{ln + 2}"
			var reducer = do |s,c,i|
				s += i == col ? "^" : (c == "\t" ? c : " ")
			message += line.split('').reduce(reducer, "")

			err:message = message
		throw err

export def analyze code, o = {}
	var meta
	try
		var ast = parse(code,o)
		meta = ast.analyze(o)
	catch e
		# console.log "something wrong {e:message}"
		unless e isa ERR.ImbaParseError
			if e:lexer
				e = ERR.ImbaParseError.new(e, tokens: e:lexer:tokens, pos: e:lexer:pos)
			else
				throw e
		meta = {warnings: [e]}
	return meta


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
