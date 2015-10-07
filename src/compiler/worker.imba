extern postMessage

var ERR = require './errors'
var lexer = require './lexer'
var rewriter = require './rewriter'
var parser = require('./parser')['parser']
var ast = require './nodes'

# Instantiate a Lexer for our use here.
var lex = lexer.Lexer.new
var Rewriter = rewriter.Rewriter

parser:lexer = lex.jisonBridge
parser:yy = ast # everything is exported right here now

var api = {}

def api.tokenize code, o = {}
	try
		o.@source = code
		lex.reset
		lex.tokenize code, o
	catch err
		# makes no sense?
		throw err

def api.parse code, o = {}
	# code will never be an array in worker?
	var tokens = code isa Array ? code : api.tokenize(code,o)

	try
		o.@source = code
		o.@tokens = tokens
		return parser.parse(tokens)

	catch err
		err:_filename = o:filename if o:filename
		throw err


def api.compile code, o = {}
	var ast = api.parse(code,o)
	try
		var res = ast.compile(o)
		return {code: res.toString, sourcemap: res:sourcemap}

	catch e
		# normalize somewhere else
		unless e isa ERR.ImbaParseError
			if e:lexer
				e = ERR.ImbaParseError.new(e, tokens: e:lexer:tokens, pos: e:lexer:pos)
			else
				e = {message: e:message}

		e = e.toJSON if e isa ERR.ImbaParseError

		return {error: e}

def api.analyze code, o = {}
	var meta
	try
		var ast = parse(code,o)
		meta = ast.analyze(loglevel: 0)
	catch e
		# console.log "something wrong {e:message}"
		unless e isa ERR.ImbaParseError
			if e:lexer
				e = ERR.ImbaParseError.new(e, tokens: e:lexer:tokens, pos: e:lexer:pos)
			else
				e = {message: e:message}

		e = e.toJSON if e isa ERR.ImbaParseError
		
		meta = {warnings: [e]}
	return meta


global def onmessage e
	var params = e:data
	var id = params:id

	if api[params[0]] isa Function
		let fn = api[params[0]]
		var result = fn.apply(api,params.slice(1))
		postMessage(id: id, data: result)


