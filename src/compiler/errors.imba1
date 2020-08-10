# imba$inlineHelpers=1
# create separate error-types with all the logic

var util = require './helpers'

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

	def desc
		var o = @options
		let msg = self:message
		if o:token and o:token.@loc == -1
			'Syntax Error'
		else
			msg
	
	def loc
		start?.region

	def toJSON
		var o = @options
		var tok = start
		return {warn: yes, message: desc, loc: loc}

	def excerpt gutter: yes, colors: no, details: yes

		var code = @code
		var loc = loc
		var lines  = code.split(/\n/g)
		var locmap = util.locationToLineColMap(code)
		var lc = locmap[loc[0]] or [0,0]
		var ln = lc[0]
		var col = lc[1]
		var line = lines[ln]

		var ln0 = Math.max(0,ln - 2)
		var ln1 = Math.min(ln0 + 5,lines:length)
		let lni = ln - ln0
		var l = ln0

		var out = while l < ln1
			var line = lines[l++]

		if gutter
			out = out.map do |line,i|
				let prefix =  "{ln0 + i + 1}"
				while prefix:length < String(ln1):length
					prefix = " {prefix}"
				if i == lni
					"   -> {prefix} | {line}"
				else
					"      {prefix} | {line}"

		if colors
			out[lni] = util:ansi.red(util:ansi.bold(out[lni]))

		if details
			out.unshift(self:message)

		return out.join('\n')

	def prettyMessage
		var excerpt = self.excerpt
