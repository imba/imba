

export var TOK = {}
var TTERMINATOR = TOK.TERMINATOR = 1
var TIDENTIFIER = TOK.IDENTIFIER = 2
var TIDENTIFIER = TOK.IVAR = 2
var CONST = TOK.CONST = 3
var VAR = TOK.VAR = 4
var IF = TOK.IF = 5
var ELSE = TOK.ELSE = 6
var DEF = TOK.DEF = 7



export class Token

	def initialize type, value, loc, len
		@type  = type
		@value = value
		@loc   = loc != null ? loc : -1
		@len   = len or 0
		@meta  = null
		this:generated = no
		this:newLine = no
		this:spaced = no
		return self

	def type
		@type

	def value
		@value

	def traverse
		return
		
	def c
		"" + @value

	def toString
		@value

	def charAt i
		@value.charAt(i)

	def slice i
		@value.slice(i)

	def region
		[@loc,@loc + (@len or @value:length)]

	def sourceMapMarker
		@loc == -1 ? ':' : "%${@loc}$%"
		# @col == -1 ? '' : "%%{@line}${@col}%%"


export def lex
	var token = this:tokens[this:pos++]
	var ttag

	if token
		ttag = token.@type
		this:yytext = token
	else
		ttag = ''

	return ttag


# export def token typ, val, line, col, len do Token.new(typ,val,line, col or 0, len or 0) # [null,typ,val,loc]
export def token typ, val do Token.new(typ,val,-1,0)

export def typ tok do tok.@type
export def val tok do tok.@value # tok[offset + 1]
export def line tok do tok.@line # tok[offset + 2]
export def loc tok do tok.@loc # tok[offset + 2]

export def setTyp tok, v do tok.@type = v
export def setVal tok, v do tok.@value = v
export def setLine tok, v do tok.@line = v
export def setLoc tok, v do tok.@loc = v


export var LBRACKET = Token.new('{','{',0,0,0)
export var RBRACKET = Token.new('}','}',0,0,0)

export var LPAREN = Token.new('(','(',0,0,0)
export var RPAREN = Token.new(')',')',0,0,0)

LBRACKET:generated = yes
RBRACKET:generated = yes
LPAREN:generated = yes
RPAREN:generated = yes

export var INDENT = Token.new('INDENT','2',0,0,0)
export var OUTDENT = Token.new('OUTDENT','2',0,0,0)