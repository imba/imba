
var fs = require 'fs'
var path = require 'path'

var imba = require '../imba'
var lexer = require './lexer'
var rewriter = require './rewriter'
export var parser = require('./parser')['parser']
var ast = require './nodes'

var T = require './token'

# Instantiate a Lexer for our use here.
export var lex = lexer.Lexer.new
export var Rewriter = rewriter.Rewriter

# The real Lexer produces a generic stream of tokens. This object provides a
# thin wrapper around it, compatible with the Jison API. We can then pass it
# directly as a "Jison lexer".

parser:lexer =
	yyloc:
		first_column: 0,
		first_line: 1,
		last_line: 1,
		last_column: 0

	lex: T:lex

	setInput: do |tokens|
		this:yylloc = this:yyloc
		this:tokens = tokens
		this:pos = 0

	upcomingInput: do ""

parser:yy = ast # everything is exported right here now

export def tokenize code, o = {}
	try
		# console.log("tokenize code",code)
		lex.tokenize code, o
	catch err
		console.log("ERROR1",err)
		throw err

export def rewrite tokens, o = {}
	var rewriter = Rewriter.new
	try
		# console.log("tokenize code",code)
		rewriter.rewrite tokens, o
	catch err
		console.log("ERROR rewriting",err)
		throw err


export def parse code, o
	try
		var tokens = code isa Array ? code : tokenize(code)
		# console.log("Tokens",tokens)
		return parser.parse tokens
	catch err
		# console.log("ERROR",err)
		err:message = "In {o:filename}, {err:message}" if o:filename
		throw err


export def compile code, o = {}
	try
		var ast = parse(code,o)
		return ast.compile(o)
	catch err
		err:message = "In {o:filename}, {err:message}" if o:filename
		throw err


export def run code, filename: nil
	var main = require:main
	# hmmmmmm
	# hmmm -- why are we chging process:argv
	# console.log "should run!"
	main:filename = process:argv[1] = (filename ? fs.realpathSync(filename) : '.')
	main:moduleCache &&= {}


	# dir = if options.filename
	#     path.dirname fs.realpathSync options.filename
	#   else
	#     fs.realpathSync '.'
	#   mainModule.paths = require('module')._nodeModulePaths dir
	# 	# console.log "run! {filename}"
	# if process.binding('natives'):module
	# hmm -- should be local variable
	var Module = require('module').Module
	main:paths = Module._nodeModulePaths(path.dirname(filename))

	if path.extname(main:filename) != '.imba' or require:extensions
		# console.log("compile the code {main:filename}")
		main._compile compile(code, arguments[1]), main:filename
	else
		main._compile code, main:filename
	# self

if require:extensions
	require:extensions['.imba'] = do |mod, filename|
		# console.log "require with extension! {filename}"
		var content = compile(fs.readFileSync(filename, 'utf8'), filename: filename)
		mod._compile content, filename

elif require:registerExtension
	require.registerExtension '.imba' do |content|
		# console.log "in registerExtension!"
		compile content




