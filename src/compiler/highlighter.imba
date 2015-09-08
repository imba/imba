
var lexer = require './lexer'
var imba = require './compiler'

var classes = {
	'+': '_imop op add math'
	'++': '_imop op incr math'
	'--': '_imop op decr math'
	'-': '_imop op sub math'
	'=': '_imop op eq'
	'/': '_imop op div math'
	'*': '_imop op mult math'
	'?': '_imop op ternary'
	',': '_imop comma'
	':': '_imop op colon'
	'.': '_imop op dot'
	'.:': '_imop op cdot'
	'?.': '_imop op qdot'
	'[': ['s','_imopen sb sbl']
	']': ['s','_imclose sb sbr']
	'(': ['s','_imopen rb rbl']
	')': ['s','_imclose rb rbr']
	'{': ['s','_imopen cb cbl']
	'}': ['s','_imclose cb cbr']
	'call_start': ['s','_imopen call rb rbl']
	'call_end': ['s','_imclose call rb rbr']
	'tag_start': ['s','_imopen tag_open']
	'tag_end': ['s','_imclose tag_close']

	'"': 'doublequote'
	"'": 'singlequote'

	'compound_assign': 'op assign compound'
	'str': '_imstr string'
	'num': '_imnum number'
	'string': '_imstr string'
	'number': '_imnum number'
	'math': '_imop op math'
	'forin': 'keyword in'
	'forof': 'keyword of'
	'own': 'keyword own'
	'compare': '_imop op compare'
	'herecomment': ['i','_herecomment']
	'relation': 'keyword relation'
	'export': 'keyword export'
	'global': 'keyword global'
	'extern': 'keyword global'
	'extend': 'keyword extend'
	'require': 'keyword require'
	'from': 'keyword from'
	'logic': 'keyword logic'
	'post_if': 'keyword if post_if'
	'post_for': 'keyword for post_for'
	'prop': 'keyword prop'
	'attr': 'keyword attr'
}

var OPEN = {
	'tag_start': '_imtag tag'
	'call_start': '_imparens call'
	'selector_start': '_imsel sel'
	'index_start': 'index'
	'indent': '_indent'
	'(': '_imparens paren'
	'{': '_imcurly curly'
	'[': '_imsquare square'
	'("': '_iminterstr string'
}

var CLOSE = {
	'tag_end': 'tag'
	'call_end': '_imparens call'
	'selector_end': 'sel'
	'index_end': 'index'
	'outdent': '_indent'
	')': 'paren'
	']': 'square'
	'}': 'curly'
	'")': 'string'
}


export class Highlighter

	prop options
	
	def initialize code, tokens, ast, o = {}
		@code = code
		@tokens = tokens
		@ast = ast

		o:render ||= {}
		o:hl ||= {}
		o:hl:newline ||= '<b class="_n">\n</b>'
		@options = o

		@options:nextVarCounter ||= 0
		@varRefs = {}

		return self

	def varRef variable
		var i = @options:nested
		var pfx = i ? 'i' : ''
		# @options:nextVarCounter
		# will stick - no
		@varRefs[variable.@ref] ||= (pfx + @options:nextVarCounter++)

	def parseWhitespace text
		# parsing comments
		var hl = @options:hl
		var comments = []

		text = text.replace(/(\#)([^\n]*)/g) do |m,s,q|
			if @options:render:comment
				m = @options:render:comment('comment',m)
			var nr = comments.push("<span class='_im _imcomment'>{m}</span>")
			"${nr - 1}$"

		text = text.replace(/(\n|[ ]+|[\t]+)/g) do |m,l|
			if l == '\n'
				hl:newline or '\n'
			elif l[0] == ' '
				hl:space isa Function ? hl.space(l) : l
			elif l[0] == '\t'
				hl:tab isa Function ? hl.tab(l) : l

		# wrapping newlines
		# if hl:newline
		# 	text = text.replace(/\n/g,hl:newline)
		# 
		# if hl:space
		# 	text = text.replace(/[ ]+/g,hl:space)
		# 
		# if hl:tab
		# 	text = text.replace(/\t+/g,hl:tab)

		if comments:length
			text = text.replace(/\$(\d+)\$/g) do |m,nr|
				comments[parseInt(nr)]
		return text


	def addSection content, type: 'code', reset: yes
		# if type == 'code'
		#	content = '<pre><code>' + content + '</code></pre>'
		var section = content: content, type: type
		sections.push(section)
		res = "" if reset
		return section

	def process
		var o = options

		# should not be included in the highlighter itself 
		var marked = require 'marked'
		var mdrenderer = marked.Renderer.new
		mdrenderer:heading = do |text, level| '<h' + level + '><span>' + text + '</span></h' + level + '>'

		marked.setOptions
			highlight: do |code,language|
				language ||= 'imba' unless code.match(/^\s*\>/)
				console.log "highlighting here!",code, language

				if language == 'imba'
					var out = imba.highlight(code, bare: yes, nested: yes)
					return out
				else
					return out
				
				return hljs.highlightAuto(code):value

		# comment renderer q = marked.inlineLexer(q, [], {})

		var str = @code
		var pos = @tokens:length

		var sections = []

		if @ast and @ast:analyze
			try @ast.analyze({}) catch e null

		var res = ""
		var pos = 0
		var caret = 0

		var open,close

		def split
			groups.push({html: res})
			res = ""

		# should be defined outside
		def addSection content, type: 'code', reset: yes
			var section = content: content, type: type
			sections.push(section)
			res = "" if reset
			return section

		while var tok = @tokens[pos++]
			var next = @tokens[pos]

			if close
				res += "</i>"
				close = null

			var typ = tok.@type.toLowerCase
			var loc = tok.@loc
			var val = tok.@value
			var len = tok.@len # or tok.@value:length
			var meta = tok.@meta

			if loc > caret
				var add = str.substring(caret,loc)
				res += parseWhitespace(add)
				caret = loc

			close = CLOSE[typ]

			if open = OPEN[typ]
				open = OPEN[val] || open
				res += "<i class='{open}'>"

			if len == 0 or typ == 'terminator' or typ == 'indent' or typ == 'outdent'
				continue 

			if tok.@col == -1
				continue 

			var node = 'span'
			var content = str.substr(loc,len)
			# temporary workaround until we redefine require as an identifier
			if typ == 'const' and content == 'require'
				typ = 'require'


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
				if content[0] == '#'
					cls.push('idref')
				else
					cls.unshift('_imtok')
				
				if meta
					# console.log "META"
					cls.push('access') if meta:type == 'ACCESS'


			if tok.@variable
				# console.log "IS VARIABLEREF",tok.@value
				cls.push('_lvar')
				let ref = self.varRef(tok.@variable)
				cls.push("ref-"+ref)

			if typ == 'herecomment'
				if o:render:comment
					content = content.replace(/(^\s*###[\s\n]*|[\n\s]*###\s*$)/g,'')
					# console.log("converting to markdown",content)
					content = o:render:comment('herecomment',content)
					# content = marked(content, renderer: mdrenderer)

					res += '<s>###</s>' + content + '<s>###</s>'
					addSection(res, type: 'comment')
					continue

				content = res += '<s>###</s>' + content.slice(3,-3) + '<s>###</s>'

			if typ == 'string'
				cls.push('pathname') if content.match(/^['"]?\.?\.\//)


			var clstr = cls.join(" ")
			clstr = '_imtok ' + clstr unless clstr.match(/\b\_/)
			res += "<{node} class='{clstr}'>" + content + "</{node}>"

		# close after?
		if close
			res += "</i>"
			close = null

		if caret < str:length - 1
			res += parseWhitespace(str.slice(caret))

		if @tokens:length == 0
			res = @code
		# split # convert to group?

		var json = sections: []

		# no sections - only code - straight out
		if o:plain
			return res

		addSection(res, type: 'code')

		var html = ''

		if o:json
			return sections

		for section in sections
			var out = section:content
			var typ = {code: 'code', comment: 'blockquote'}[section:type] or 'div'
			html += "<{typ} class='{section:type} imbalang'>" + out + "</{typ}>"
			# html += section:content # '<pre><code>' + group:html + '</code></pre>'
		# html += '</code>'

		unless o:bare
			html = '<link rel="stylesheet" href="imba.css" media="screen"></link><script src="imba.js"></script>' + html + '<script src="hl.js"></script>'

		return html