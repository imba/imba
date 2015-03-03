
# really need to clean this up
class AST.Identifier < AST.ValueNode

	prop safechain

	def region
		value:_region

	def load v
		var val = (v isa AST.Identifier ? v.value : v)
		var len = val:length
		# experimental way to include reserved-info
		# if v.match()
		if val[len - 1] == '?'
			# p "safechain identifier?!"
			safechain = yes
			val = val.substr(0,len - 1)

		return val

	def isValidIdentifier
		yes
		
	def isReserved
		value:reserved

	def symbol
		@symbol ||= value.c.toSymbol

	def setter
		@setter ||= AST.Identifier.new("set-{value.c}")

	def toSymbol
		symbol

	def toSetter
		AST.Symbol.new("{value.c}=")

	def js
		symbol

	def dump
		{ loc: region, value: value }


		
class AST.TagId < AST.Identifier

	def js
		"id$('{value.c}')"
		
# This is not an identifier - it is really a string
# Is this not a literal?

# FIXME Rename to IvarLiteral? or simply Literal with type Ivar
class AST.Ivar < AST.Identifier

	def name
		value.c.camelCase.replace(/^@/,'')
	# the @ should possibly be gone from the start?
	def js
		value.c.camelCase.replace(/^@/,'_')

# Ambiguous - We need to be consistent about Const vs ConstAccess
# Becomes more important when we implement typeinference and code-analysis
class AST.Const < AST.Identifier
	

class AST.TagTypeIdentifier < AST.Identifier

	prop name
	prop ns

	def load val
		var parts = val.split(":")
		@raw = val
		@name = parts.pop
		@ns = parts.shift # if any?
		return val.toLowerCase

	def js
		# p "tagtypeidentifier.js {self}"
		return "IMBA_TAGS.{@raw.replace(":","$")}"

	def func
		var name = @name.replace(/-/g,'_').replace(/\#/,'') # hmm
		name += "${@ns.toLowerCase}" if @ns
		name

	def id
		var m = @raw.match(/\#([\w\-\d\_]+)\b/)
		m ? m[1] : nil
		

	def flag
		"_" + name.replace(/--/g,'_').toLowerCase

	def sel
		".{flag}" # + name.replace(/-/g,'_').toLowerCase

	def string
		value


class AST.Argvar < AST.ValueNode

	def c
		# NEXT -- global.parseInt or Number.parseInt (better)
		var v = global.parseInt(value)

		# FIXME Not needed anymore? I think the lexer handles this
		return "arguments" if v == 0

		var s = scope__
		# params need to go up to the closeste method-scope
		var par = s.params.at(value - 1,yes)
		"{par.name.c}"
		