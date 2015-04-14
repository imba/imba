
class AST.Access < AST.Op

	def clone left, right
		var ctor = self:constructor
		ctor.new(op,left,right)

	def js
		var raw = null
		var rgt = right

		# is this right? Should not the index compile the brackets
		# or value is a symbol -- should be the same, no?
		if rgt isa AST.Index and (rgt.value isa AST.Str or rgt.value isa AST.Symbol)
			rgt = rgt.value

		# TODO do the identifier-validation in a central place instead
		if rgt isa AST.Str and rgt.isValidIdentifier
			raw = rgt.raw

		elif rgt isa AST.Symbol and rgt.isValidIdentifier
			raw = rgt.raw

		elif rgt isa AST.Identifier and rgt.isValidIdentifier
			raw = rgt.c

		# really?
		var ctx = (left || scope__.context)

		if ctx isa AST.RootScopeContext
			# this is a hacky workaround
			return (raw ? raw : "global[{rgt.c}]")

		# see if it needs quoting
		if raw
			# need to check to see if it is legal
			return ctx ? "{ctx.c}.{raw}" : raw
		else
			return "{ctx.c}[{rgt.c(expression: yes)}]"

	def visit
		left.traverse if left
		right.traverse if right
		return

	def isExpressable
		yes # ?

	def isExpressable
		true

	def alias
		right isa AST.Identifier ? right.toSymbol : super

	def safechain
		right.safechain


# Should change this to just refer directly to the variable? Or VarReference
class AST.LocalVarAccess < AST.Access

	prop safechain

	def js
		if right isa AST.Variable and right.type == 'meth'
			return "{right.c}()" unless up isa AST.Call

		right.c

	def variable
		right

	def cache o = {}
		super if o:force # hmm
		self

	def alias
		variable.@alias or super # if resolved?


class AST.GlobalVarAccess < AST.ValueNode

	def js
		value.c


class AST.ObjectAccess < AST.Access


class AST.PropertyAccess < AST.Access

	def js o
		if var rec = receiver
			var ast = CALL(OP('.',left,right),[])
			ast.receiver = rec
			return ast.c

		# really need to fix this - for sure
		var js = "{super}"
		js += "()" unless (up isa AST.Call or up isa AST.Util.IsFunction)
		return js

	def receiver
		if left isa AST.SuperAccess || left isa AST.Super
			AST.SELF
		else
			null


class AST.IvarAccess < AST.Access

	def cache
		# WARN hmm, this is not right... when accessing on another object it will need to be cached
		return self


class AST.ConstAccess < AST.Access


class AST.IndexAccess < AST.Access

	def cache o = {}
		return super if o:force
		right.cache
		self


class AST.SuperAccess < AST.Access

	def js o
		var m = o.method
		var up = o.parent
		var deep = o.parent isa AST.Access

		var out = "{left.c}.__super__"

		unless up isa AST.Access
			out += ".{m.supername.c}"
			unless up isa AST.Call # autocall?
				out += ".apply({m.scope.context.c},arguments)"

		return out

	def receiver
		AST.SELF


class AST.VarOrAccess < AST.ValueNode

	def visit

		@identifier = value

		var scope = scope__
		var variable = scope.lookup(value)

		if variable && variable.declarator

			variable.addReference(self) # hmm

			self.value = variable.accessor(self)
			self.value.safechain = safechain # hmm

		elif value.symbol.indexOf('$') >= 0
			self.value = AST.GlobalVarAccess.new(value)
		else
			self.value = AST.PropertyAccess.new(".",scope.context,value)

		@value.traverse

	def c
		value.c

	def node
		value

	def symbol
		value and value.symbol

	def cache o = {}
		value.cache(o)

	def decache
		value.decache
		self

	def dom
		value.dom

	def safechain
		@identifier.safechain # hmm

	def dump
		{ loc: loc }

	def loc
		var loc = @identifier.region
		return loc or [0,0]

	def toString
		"VarOrAccess({value})"


class AST.VarReference < AST.ValueNode

	# TODO VarBlock should convert these to plain / dumb nodes

	prop variable

	def js o
		# experimental fix
		
		var ref = @variable
		var out = ref.c

		if ref && !ref.option(:declared)
			if o.up(AST.VarBlock)
				ref.set(declared: yes)
			elif o.isExpression or option(:export) # why?
				ref.autodeclare
			else
				out = "var {out}"
				ref.set(declared: yes)

		# need to think the export through -- like registering somehow
		# should register in scope - export on analysis++
		if option(:export)
			out = "module.exports.{ref.c} = {ref.c}"

		return out

	def declare
		self

	def consume node
		@variable && @variable.autodeclare
		self

	def visit
		var name = value.c
		# what about looking up? - on register we want to mark
		self.variable ||= scope__.register(name,null)
		# FIXME -- should not simply override the declarator here(!)
		self.variable.declarator = self # hmm, cannot be certain, but ok for now
		self.variable.addReference(value) # is this the first reference?

		# implement
		# if option(:export)

		self

	def refnr
		variable.references.indexOf(value)

	# convert this into a list of references
	def addExpression expr
		AST.VarBlock.new([self]).addExpression(expr)

