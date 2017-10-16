# imba$inlineHelpers=1
# var imba = require '../imba'
var T = require './token'
var util = require './helpers'
var lexer = require './lexer'
var rewriter = require './rewriter'
export var parser = require('../../lib/compiler/parser')['parser']
var ast = require './nodes'

import ImbaParseError from './errors'

# Instantiate a Lexer for our use here.
export var lex = lexer.Lexer.new
export var Rewriter = rewriter.Rewriter
var rewriter = Rewriter.new

parser:lexer = lex.jisonBridge
parser:yy = ast # everything is exported right here now


export def tokenize code, o = {}
	try
		# console.log('tokenize') if o:profile
		console.time('tokenize') if o:profile
		o.@source = code
		lex.reset
		var tokens = lex.tokenize code, o
		console.timeEnd('tokenize') if o:profile

		unless o:rewrite === no
			tokens = rewriter.rewrite(tokens,o)
		return tokens

	catch err
		throw err

export def rewrite tokens, o = {}
	try
		console.time('rewrite') if o:profile
		tokens = rewriter.rewrite tokens, o
		console.timeEnd('rewrite') if o:profile
	catch err
		throw err
	return tokens


export def parse code, o = {}
	var tokens = code isa Array ? code : tokenize(code,o)
	try
		o.@source ||= code if tokens != code
		o.@tokens = tokens
		return parser.parse tokens
	catch err
		err:_code = code
		err:_filename = o:filename if o:filename
		throw err


export def compile code, o = {}
	try
		# check if code is completely blank
		unless /\S/.test(code)
			return {js: ""}

		var tokens = tokenize(code, o)
		var ast = parse(tokens, o)
		return ast.compile(o)
	catch err
		err:_code = code
		err:_filename = o:filename if o:filename
		if o:evaling
			console.log "error during compile",o:filename
		throw err

export def analyze code, o = {}
	var meta
	try
		var ast = parse(code,o)
		meta = ast.analyze(o)
	catch e
		unless e isa ImbaParseError
			if e:lexer
				e = ImbaParseError.new(e, tokens: e:lexer:tokens, pos: e:lexer:pos)
			else
				throw e
		meta = {warnings: [e]}
	return meta
