# create separate error-types with all the logic

export class ImbaParseError < Error
	
	def self.wrap err
		# what about the stacktrace?
		ImbaParseError.new(err)

	def initialize e,o
		this:error = e
		this:message = e:message
		this:filename = e:filename
		this:line = e:line
		@options = o or {}
		self

	def set opts
		@options ||= {}
		for own k,v of opts
			@options[k] = v
		self

	def start
		var o = @options
		var idx = o:pos - 1
		var tok = o:tokens and o:tokens[idx]
		tok = o:tokens[--idx] while tok and tok.@loc == -1
		return tok


	def toJSON
		var o = @options
		var tok = start
		# var tok = o:tokens and o:tokens[o:pos - 1]
		# var loc = tok and [tok.@loc,tok.@loc + (tok.@len or tok.@value:length)] or [0,0]
		# , col: tok.@col, line: tok.@line
		return {warn: yes, message: self:message, loc: tok.region}
