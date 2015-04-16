

export class Token
	
	# Token:prototype:generated = no
	# Token:prototype:reserved = no
	# Token:prototype:newLine = no
	# Token:prototype:spaced = no

	def initialize type, value, line, region
		@type = type
		@value = value
		@line = line or 0
		@region = region
		return self

	def type
		@type

	def value
		@value

	def loc
		@region

	def traverse
		return
		
	def c
		"" + @value

	def toString
		"" + @value

	# added for legacy reasons
	def charAt i
		@value.charAt(i)

	def slice i
		@value.slice(i)
		

export def lex
	var token = this:tokens[this:pos++]
	var ttag, loc

	if token
		ttag = token.@type
		this:yytext = token # .@value

		if var line = token.@line
			this:yylineno = line
			this:yylloc:first_line = line
			this:yylloc:last_line = line

	else
		ttag = ''

	return ttag


export def token typ, val, line, region do Token.new(typ,val,line,region) # [null,typ,val,loc]
export def typ tok do tok.@type
export def val tok do tok.@value # tok[offset + 1]
export def loc tok do tok.@region # tok[offset + 2]

export def setTyp tok, v do tok.@type = v
export def setVal tok, v do tok.@value = v
export def setLoc tok, v do tok.@region = v
