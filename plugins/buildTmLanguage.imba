
# require './runtime'
var fs = require 'fs'

RULES = []
REPOSITORY = {}
STACK = []


extend class RegExp

	def to-plist
		# p 'regexp to plist!'
		var src = self:source
		var str = src.replace(/&/g,'&amp;')
		str = str.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
		"<string>" + str + "</string>"

extend class String

	def to-plist
		"<string>" + self + "</string>"

	def to-scope
		var str = self.replace(/\-/g,'.')
		str += ".imba" unless str.match(/\bimba\b/)
		return str

extend class Array

	def to-plist
		"<array>\n" + map(|v| v.to-plist ).join("\n") + "</array>\n"

extend class Object

	def to-plist
		var str = ""
		for own k,v of self
			str += "<key>{k}</key>\n{v.to-plist}\n"
			# keys = v isa Object ? Object.keys(v) : []
			# typ = v isa Array ? "array" : (keys:length ? "dict" : "string")
			# p 'value to plist',v
		return "<dict>\n{str}</dict>\n"

class Rule

	def self.parse name, opts
		name && name.match(/^\#/) ? RepoRule.new(name.substr(1),opts) : self.new(name,opts)
		
	def initialize name, o
		if @name = name
			@path = STACK:length ? STACK.join(".") + "." + name : name
			@path = @path.replace(/\-/g,'.') # bug with inherited-class
			@path += ".imba" unless @path.match(/\bimba\b/)

		o = {match: o.shift, captures: o} if o isa Array
		o = {match: o} if o isa RegExp
		
		@options = o
		self

	def to-plist
		var o = @options
		var plist = {}
		plist:name = @path if @name
		plist:match = m if var m = o:match

		var capt = do |obj|
			var c = {}
			if obj isa Array
				for v,i in obj
					c[i] = {name: v.to-scope} if v
			else
				# log "running through captures as object",obj
				for own k,v of obj
					# log "key {k} {v}", typeof v
					c[k] = {name: v.to-scope} if v
			return c

		if o:begin isa RegExp or typeof o:begin == 'string'
			plist:begin = o:begin
		elif o:begin isa Array
			plist:begin = o:begin.shift
			plist:beginCaptures = capt(o:begin)
		elif o:begin isa Object
			plist:begin = o:begin:match
			plist:beginCaptures = capt(o:begin:captures)

		if o:end isa RegExp or typeof o:end == 'string'
			plist:end = o:end
		elif o:end isa Array
			plist:end = o:end.shift
			plist:endCaptures = capt(o:end)
		elif o:end isa Object
			plist:end = o:end:match
			plist:endCaptures = capt(o:end:captures)

		if o:captures
			plist:captures = capt(o:captures)

		if m = o:contentName
			plist:contentName = m.to-scope

		if o:patterns
			plist:patterns = o:patterns.map do |pattern|
				typeof pattern == 'string' ? {include: pattern} : pattern

		var str = ""
		for own k,v of plist
			str += "<key>{k}</key>\n{v.to-plist}\n"

		return "<dict>\n{str}</dict>\n"

class RepoRule < Rule

	def initialize name, opts
		@name = name
		var o = @options = {patterns: []}
		REPOSITORY[name] = self

		# p "handling RepoRule",opts

		if opts isa Array
			for rule in opts
				rule = Rule.parse(rule:name,rule) if rule isa Object
				o:patterns.push(rule)
		else
			for own k,v of opts
				# p "handling RepoRule pattern {k}"
				# rule = v == true ? {include: k} : Rule.parse(k,v)
				o:patterns.push(Rule.parse(k,v))

		self
	
	def to-plist
		var o = @options
		var plist = {}
		if o:patterns
			plist:patterns = o:patterns.map do |pattern|
				typeof pattern == 'string' ? {include: pattern} : pattern

		"\n{plist.to-plist}"
		


def parse name, options, stack
	return {name: stack.join(".") + "." + name, match: options}

def repo object
	for own k,v of object
		RepoRule.new(k,v)

def rule object
	# $console.log('RULE HERE!!!',object)

	for own k,v of object
		if v isa RegExp
			# parse(k,v,STACK)
			RULES.push Rule.parse(k,v)
		elif v isa Array
			RULES.push Rule.parse(k,v)
		elif v isa Object
			if k.substr(0,1) == '#'
				# p "FOUND REPORUL!",k,v
				Rule.parse(k,v)
			elif v:begin or v:end or v:match
				# p "deep rule!"
				RULES.push Rule.parse(k,v)
			else
				STACK.push(k)
				rule(v)
				STACK.pop
		else
			RULES.push Rule.parse(k,v)
	return

# p String:prototype:toPlist.toString

# begin: (?<!#)###(?!#)
# captures:
#   '0': {name: punctuation.definition.comment.imba}
# end: '###(?:[ \t]*\n)'
# name: comment.block.imba

# comment-block
rule "comment-block":
	begin: /^[\t]*###/
	captures: ['punctuation.definition.comment.imba']
	end: /###(?:[ \t]*\n)/

rule "comment-line": /(?:^[ \t]+)?(#\s).*$\n?/

rule "string.quoted.single":
	begin: ["'",'punctuation.definition.string.begin']
	end: ["'",'punctuation.definition.string.end']
	patterns: []

rule "string.quoted.double":	
	begin: ['"','punctuation.definition.string.begin']
	end: ['"','punctuation.definition.string.end']
	patterns: ['#interpolated_imba']

rule "string.regexp.multiline":
	begin: [/(\/{3})/,'punctuation.definition.regex.end']
	end: [/(\/{3})([imgy]{0,4})/,nil,'punctuation.definition.regex.end','string.regexp.flags']
	patterns: ['#embedded_comment']

rule "string.regexp.simple":
	begin: [/(\/)(?=[^\t\n]*\/)/,'punctuation.definition.regex.begin']
	end: [/(\/)([imgy]{0,4})/,nil,'punctuation.definition.regex.end','string.regexp.flags']
	patterns: ['#regex_content']

rule "meta.tag.empty": 
	match: /(\<)(\>)/
	captures: [nil,'punctuation.section.tag.open','punctuation.section.tag.close']

rule "meta.tag":
	begin: [/(\<)(([a-z\-]+\:|\@|\.|\#)?([a-z][a-z\-\d]*))/,nil,'punctuation.section.tag.open','entity.name.tag.type']
	end: [/(\>)/,nil,'punctuation.section.tag.close']
	patterns: ['#tag_imba']

rule "meta.selector.imba.all":
	begin: [/(\$|%)\(/,'punctuation.definition.selector.begin']
	end: [/\)/,'punctuation.definition.selector.end']
	patterns: ['#selector_content']

rule "meta.selector.imba.first":
	begin: [/(\$\$|%%)\(/,'punctuation.definition.selector.begin']
	end: [/\)/,'punctuation.definition.selector.close']
	patterns: ['#selector_content']

rule "meta.selector.single.imba":
	begin: [/(%)(?=[\w\.])/,'punctuation.definition.selector.begin']
	end: [/(?=[\s\n\)\}\,])/,'punctuation.definition.selector.close']
	patterns: ['#selector_content']


rule "meta.selector.id.imba":
	match: /(#[A-Za-z][A-Za-z\d]*(-[A-Za-z\d]+)*)/
	captures: ['entity.name.tag.html.id']

# class (([A-Z][a-z0-9_]*\.)*([A-Z][a-z0-9_]*))

# match: /\s*(class)\s+(([A-Z][a-z0-9_]*\.)*([A-Z][a-z0-9_]*))(\s*(<)\s*(([A-Z][a-z0-9_]*\.)*([A-Z][a-z0-9_]*)))?/
# 		captures:
# 			1: 'keyword.control.class'
# 			2: 'entity.name.type.class'
# 			3: 'entity.name.type.class.namespace'
# 			4: 'entity.name.type.class.name'
# 			5: 'meta.class.inheritance'
# 			6: 'keyword.control.extends'
# 			7: 'entity.other.inherited-class'
# 			8: 'entity.other.inherited-class.namespace'
# 			9: 'entity.other.inherited-class.name'

# FIXME should not name the whole thing
rule "meta-class":
	begin: 
		match: /(\t*)(local\s|export\s|extend\s)*(class)\s+(([A-Z]\w*\.)*([A-Z]\w*))(\s*(<)\s*(([A-Z]\w*\.)*([A-Z]\w*)))?/
		captures:
			2: 'keyword.control.access'
			3: 'keyword.control.class'
			4: 'entity.name.type.class'
			5: 'entity.name.type.class.namespace'
			6: 'entity.name.type.class.name'
			7: 'meta.class.inheritance'
			8: 'keyword.control.extends'
			9: 'entity.other.inherited-class'
			10: 'entity.other.inherited-class.namespace'
			11: 'entity.other.inherited-class.name'
	contentName: 'meta.class.body'
	patterns: ['$self']
	end: '^(?!(\\1\\t+|\\t*$))'


# tag (([a-z\-]+:)*([a-z\-]+))

rule "meta-tagdef":
	match: /\s*(tag)\s+([a-z\-]+:)?(\#?[a-z\-]+)(\s*(<)\s*(\#?[a-z][a-z0-9_:\-]*))?/
	captures:
		1: 'keyword.control.class'
		2: 'entity.name.type.tag.namespace'
		3: 'entity.name.type.tag.name'
		5: 'keyword.control.extends'
		6: 'entity.other.superclass'

rule "meta-property":
	match: /\s*(property|prop) (([a-z\_][\w\_]*)(\-[\d\w\_]+)*)?/
	captures:
		1: 'keyword.control.property'
		2: 'entity.name.property'

# method (entity.name.function, entity.name.function meta.function.owner) (([a-z][a-z0-9_]*\.)?([a-z][a-z0-9_\-]*[\=\?\!]?))

var reg = /// ^
(\t*)
(local\s|export\s|global\s)*
(def)\s # keyword.control.def
( # entity.name.function
	([A-Za-z][A-Za-z0-9_]*[\.\#])? # meta.function.owner
	([A-Za-z\_][A-Za-z0-9_\-]*[\=\?\!]?)
)
(?=([\s\t]|$))
///

# reg = /(([a-z][a-z0-9_]*\.)?([a-z][a-z0-9_\-]*[\=\?\!]?))/

# method definition
rule "meta.function.method":
	begin: [reg,"keyword.control.access","meta.function.method.declaration",nil,'keyword.control.def','entity.name.function','meta.function.owner']
	end: [/($|\b(do)\b)/,nil,nil,'keyword.control.def.block']
	contentName: 'variable.parameter.function.imba'
	patterns: ["$self"]

# put this in here first?
rule "keyword":
	"other.special-method": /\b(initialize|new|include|extend|raise|attr_reader|attr_writer|attr_accessor|attr|private|module_function|public|protected|prop|property)\b/

rule "support.function": /\b(log|setInterval|setTimeout)\b/

rule accessor: 
	ivar: 
		match: /(\.)@[A-Z\_a-z\d][\w\_\d]*(\-[A-Z\_a-z\d]+)*/
		captures: ['variable.instance','punctuation.access.ivar']


	method: 
		special:
			match: /(\.)(new|include|extend)/
			captures: ['identifier.method','punctuation.access.method','keyword.other.special-method']

		regular:
			match: /(\.)[a-z\_][\w\_]*(\-[A-Z\_a-z\d]+)*/
			captures: ['identifier.method','punctuation.access.method']

	class: 
		match: /(\.)[A-Z\_]+([A-Za-z\d]+)*/
		captures: ['identifier.class','punctuation.access.class']


rule "meta.function.block.params":
	begin: [/\b(do)\s*(\|)/,nil,'keyword.control.block','variable.parameter.function']
	end: [/(\|)/,nil,'variable.parameter.function']
	contentName: 'variable.parameter.function'
	patterns: ["$self"]

# do block
rule "meta.function.block.paramless":
	match: /\b(do)\b/
	captures:
		1: 'keyword.control.block'	

# for object-keys like   property: value

rule variable:
	instance: /@[A-Z\_a-z\d]+(\-[A-Z\_a-z\d]+)*/
	language:
		"scope.self": /self/
		"scope.this": /this/

rule keyword:
	control: /(begin|continue|class|tag|if|else|elif|for|own|of|in|isa|instanceof|typeof|module|then|unless|until|switch|try|finally|catch|when|while|loop|break|return|throw|await|extern|delete)\b/
	special: /\b(require|global|super)\b/
	"control.var": /\b(var|let)\b/

rule "constant.numeric":
	float: /\d+\.\d+/ # float
	integer: /(\b[0-9]+)/ # integer

rule "constant.language":
	boolean: /\b(yes|no|true|false)\b/
	other: /\b(undefined|null|nil)\b/
	math: /π/

rule identifier:
	key: /[\w\_]+(\-[\w\d\_]+)*[\?\!]?\:(\s|\[|$)/
	const: /\b([A-Z\_]+)\b/
	class: /[A-Z]+([A-Za-z\d]+)?/
	symbol: /\:[\w\d\_]+(\-[\w\d\_]+)*[\?\!\=]?/
	basic: /[a-z_A-Z][\_\w\d]*(\-[_\d\w]+)?/

rule "keyword.operator":
	comparison: /<=>|<(?!<|=)|>(?!<|=|>)|<=|>=| is | isnt | not |===|==|\?=|=~|!=|!~\?|≤|≥|≡|≈/
	logical: /\bnot\b|&&| and |\|\|| or | in |\^|\s:\\s|\?\|{1,2}|\?\&{1,2}|[\?\&]\>|∩|∪|∈|∉|∋|∌/
	arithmetic: /(%|&|\*\*|\*|\+|\-|\/|×|÷|√)/
	assignment: /\=|\?\=|\&\&?\=/

rule punctuation:
	section:
		scope: /\{|\}/
		array: /\[|\]/
		function: /\(|\)/

# rule "#method_arguments":
# 
# 	"variable.parameter.function.default":
# 		begin: /([\_a-z][a-z\d\_\-]*)\s*(=)\s*/
# 		end: /([\,]|$)/
# 		patterns: ['$self']
# 
# 	"variable.parameter.function": /\b([\_a-z][a-z\d\_\-]*)\b/

rule "#interpolated_imba":
	"source.imba.embedded.source":
		begin: /\{/
		end: /\}/
		captures: ['punctuation.section.embedded']
		patterns: ['#nest_curly_and_self','$self']

repo nest_curly: [{
	begin: /\{/
	captures: ['punctuation.section.scope']
	patterns: ['#nest_curly']
	end: /\}/
}]

repo nest_curly_and_self: [{
	begin: /\{/
	captures: ['punctuation.section.scope']
	patterns: ['#nest_curly_and_self']
	end: /\}/
},'$self']

repo embedded_comment:
	"comment.line": [/(#)\s+(.*)$\n?/,nil,'punctuation.definition.comment']

repo regex_content:
	"string.regex.group": /GROUP/
	"string.regex.escaped": /\\([0-7]{1,3}|x[\da-fA-F]{1,2}|\/|.)/
	# "constant.character.escape": /\\(?:[0-7]{1,3}|x[\da-fA-F]{1,2}|.)/
	# patterns: ["#escaped_char"]

repo selector_content:
	"meta.selector.class": /\.[A-Za-z_\-][\w_\-\d]*\b/

repo escaped_char:
	"constant.character.escape": /\\(?:[0-7]{1,3}|x[\da-fA-F]{1,2}|.)/

# rule "#nest_curly_and_self": [{
# 	begin: /\{/
# 	captures: ['punctuation.section.scope']
# 	patterns: ['#nest_curly_and_self']
# 	end: /\}/
# },'$self']
# 	entity-name-tag-type: /[a-z\-]+(\:[a-z]+)?(?=[#\.\s\>])/

rule "#tag_imba":

	"entity-name-tag-class-evaled":
		begin: /\.\{/
		end: /\}/
		patterns: ['$self']

	"entity-name-tag-id-evaled":
		begin: /#\{/
		end: /\}/
		patterns: ['$self']

	"entity-name-tag-object":
		begin: /\[/
		end: /\]/
		patterns: ['$self']

	"entity-name-tag-id": /#[a-z]*/
	"entity-name-tag-class": /\.[A-Za-z\-\_\d]*/
	"entity-name-tag-ref": /\@[A-Za-z\-\_\d]*/

	"entity-name-tag-attribute":
		begin: /[a-z]+(\:[a-z]+)?\s*\=/
		end: /((?=([\w\-\_\:]+)\s*\=)|(?=>))/
		patterns: ['$self']

rule 
	meta:
		indent: /^(\t+)/
		invalid:
			indent: /^([ ]+)/

# rule "#meta_class":
# 	meta-class:
# 		match: /\s*(class)\s+([A-Z][.a-z0-9_]+)/
# 		captures:
# 			1: 'keyword.control.class'
# 			2: 'entity.name.type.class'


# $console.log RULES

# exporting
var plist = """
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
	<dict>
		<key>fileTypes</key>
		<array><string>imba</string></array>
		<key>name</key>
		<string>Imba</string>
		<key>patterns</key>
		<array>
			{RULES.map(|r|r.to-plist).join("\n").replace(/\n/g,"\n\t\t")}
		</array>
		<key>repository</key>
		{REPOSITORY.to-plist}
		<key>scopeName</key>
		<string>source.imba</string>
		<key>uuid</key>
		<string>af5d7d71-7c4e-43d9-b91e-dce3f02c3c32</string>
	</dict>
</plist>
"""

console.log plist
# $console.log plist


 # - captures:
 #     '1': {name: keyword.control.class.imba}
 #     '2': {name: entity.name.type.class.imba}
 #     '4': {name: entity.other.inherited-class.imba}
 #     '5': {name: punctuation.separator.inheritance.imba}
 #     '6': {name: variable.other.object.imba}
 #     '7': {name: punctuation.definition.variable.imba}
 #   match: ^\s*(class|tag)\s+((\#?[.a-zA-Z0-9_:\-]+(\s*(<)\s*[.a-zA-Z0-9_:\-]+)?)|((<<)\s*[.a-zA-Z0-9_:]+))
 #   name: meta.class.imba

# <dict>
# 	<key>begin</key>
# 	<string>\{</string>
# 	<key>captures</key>
# 	<dict>
# 		<key>0</key>
# 		<dict>
# 			<key>name</key>
# 			<string>punctuation.section.embedded.imba</string>
# 		</dict>
# 	</dict>
# 	<key>end</key>
# 	<string>\}</string>
# 	<key>name</key>
# 	<string>source.imba.embedded.source</string>
# 	<key>patterns</key>
# 	<array>
# 		<dict>
# 			<key>include</key>
# 			<string>#nest_curly_and_self</string>
# 		</dict>
# 		<dict>
# 			<key>include</key>
# 			<string>$self</string>
# 		</dict>
# 	</array>
# </dict>
# console.log __dirname

fs.writeFile("{__dirname}/sublime/Imba.tmLanguage", plist) do |err|
	console.log "wrote file(!)",err
