
var lexer = require './lexer'

export class Highlighter

	prop options
	
	def initialize code, tokens, ast, options = {}
		@code = code
		@tokens = tokens
		@ast = ast
		@options = options
		return self

	def process
		var marked = require 'marked'
		var str = @code
		var pos = @tokens:length

		var sections = []

		try @ast.analyze({}) catch e nil

		var res = ""
		# should rather add onto another string instead of reslicing the same string on every iteration

		if false
			while var tok = @tokens[--pos]
				continue if tok.@col == -1
				var loc = tok.@loc
				var len = tok.@len or tok.@value:length
				true
				console.log "token {loc}"
				str = str.substring(0,loc - 1) + '<a>' + str.substr(loc,len) + '</a>' + str.slice(loc + len)

		var pos = 0
		var caret = 0

		var classes = {
			'+': 'op add math'
			'-': 'op sub math'
			'=': 'op eq'
			'/': 'op div math'
			'*': 'op mult math'
			'?': 'op ternary'
			',': 'comma'
			':': 'colon'
			'.': 'op dot'
			'?.': 'op qdot'
			'[': ['s','sbl']
			']': ['s','sbr']
			'math': 'op math'
			'forin': 'keyword in'
			'string': 'str'
			'compare': 'op compare'
			'herecomment': ['blockquote','comment']
			'relation': 'keyword relation'
			'from': 'keyword from'
			'logic': 'keyword logic'
			'post_if': 'keyword if'
			'prop': 'keyword prop'
		}

		var OPEN = {
			'tag_start': 'tag'
			'selector_start': 'sel'
			'indent': '_indent'
			'(': 'paren'
			'{': 'curly'
			'[': 'square'
			'("': 'str'
		}

		var CLOSE = {
			'tag_end': 'tag'
			'selector_end': 'sel'
			'outdent': '_indent'
			')': 'paren'
			']': 'square'
			'}': 'curly'
			'")': 'str'
		}

		var open,close

		def comments sub
			sub.replace(/(\#)([^\n]*)/g) do |m,s,q|
				# q = marked(q)
				# q = 
				"<q><s>{s}</s>{q}</q>"

		def split
			groups.push({html: res})
			res = ""

		def addSection content, type: 'code', reset: yes
			# if type == 'code'
			#	content = '<pre><code>' + content + '</code></pre>'
			var section = content: content, type: type
			sections.push(section)
			res = "" if reset
			return section

		while var tok = @tokens[pos++]
			var next = @tokens[pos]

			if close
				res += "</i>"
				close = nil

			var typ = tok.@type.toLowerCase
			var loc = tok.@loc
			var val = tok.@value
			var len = tok.@len # or tok.@value:length

			if loc > caret
				var add = str.substring(caret,loc)
				res += comments(add)
				caret = loc


			close = CLOSE[typ]

			if open = OPEN[typ]
				open = OPEN[val] || open
				res += "<i class='{open}'>"

			# elif var close = CLOSE[typ]
			#	res += "</i>"
			#	# should close after?
			#	# either on the next 

			# adding some interpolators
			# if loc and val == '("'
			# 	res += '<i>'
			# elif loc and val == '")'
			# 	res += '</i>'

			if len == 0 or typ == 'terminator' or typ == 'indent' or typ == 'outdent'
				continue 

			if tok.@col == -1
				continue 

			var node = 'span'
			var content = str.substr(loc,len)
			var cls = classes[typ] or typ

			if cls isa Array
				node = cls[0]
				cls = cls[1]

			cls = cls.split(" ")
			# console.log "adding token {tok.@type}"
			if lexer.ALL_KEYWORDS.indexOf(typ) >= 0
				cls.unshift('keyword')

			caret = loc + len

			if typ == 'identifier'
				if tok.@variable
					# console.log "IS VARIABLEREF",tok.@value
					cls.push('_lvar')
					cls.push("ref-"+tok.@variable.@ref)
				elif var m = tok.@meta
					# console.log "META"
					cls.push('access') if m:type == 'ACCESS'


			if typ == 'herecomment'
				addSection(res) # resetting
				content = content.replace(/(^\s*###\n*|\n*###\s*$)/g,'<s>$1</s>')
				# content = marked(content)

			if typ == 'string'
				content = content.replace(/(^['"]|['"]$)/g) do |m| '<s>' + m + '</s>'

			res += "<{node} class='{cls.join(" ")}'>" + content + "</{node}>"

			if typ == 'herecomment'
				addSection(res, type: 'comment') # reset here as well

			# true
			# console.log "token {loc}"
			# str = str.substring(0,loc - 1) + '<a>' + str.substr(loc,len) + '</a>' + str.slice(loc + len)

		if caret < str:length - 1
			res += comments(str.slice(caret))

		# split # convert to group?

		var json = sections: []

		addSection(res, type: 'code')

		var html = ''
		html += '<code>'

		for section in sections
			var out = section:content
			html += "<div class='{section:type} imbalang'>" + out + '</div>'
			# html += section:content # '<pre><code>' + group:html + '</code></pre>'
		html += '</code>'

		unless options:bare
			html = '<link rel="stylesheet" href="imba.css" media="screen"></link><script src="imba.js"></script>' + html + '<script src="hl.js"></script>'

		return html