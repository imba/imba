
# var fs = require 'fs'
# var path = require 'path'
# var promise = require 'bluebird'

require '../imba'

var lexer 	= require './lexer'
var parser	= require('./parser')['parser']
var ast 	= require './ast'
# var vm = require 'vm'
# require files needed to run imba
# whole runtime - no?

# should this really happen up here?

# require '../imba/node'


# setting up the actual compiler


# Instantiate a Lexer for our use here.
export var lex = lexer.Lexer.new

# The real Lexer produces a generic stream of tokens. This object provides a
# thin wrapper around it, compatible with the Jison API. We can then pass it
# directly as a "Jison lexer".

parser:lexer =
	options:
		ranges: true

	lex: do
		var token = this:tokens[this:pos++]
		var ttag

		if token
			ttag, this:yytext, this:yylloc = token

			if this:yylloc
				this:currloc = this:yylloc
			else
				this:yylloc = this:currloc
			this:yylineno = this:yylloc && this:yylloc:first_line
		else
			ttag = ''

		return ttag

	setInput: do |tokens|
		this:tokens = tokens
		this:pos = 0

	upcomingInput: do ""

parser:yy = AST # require './../nodes'

export def tokenize code, o = {}
	try
		# console.log("tokenize code",code)
		lex.tokenize code, o
	catch err
		console.log("ERROR1",err)
		throw err


export def parse code, o
	try
		# hmmm
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
