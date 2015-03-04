
# interface MemberExpression <: Expression {
#     type: "MemberExpression";
#     object: Expression;
#     property: Identifier | Expression;
#     computed: boolean;
# }

class AST.Access < AST.Op

	def clone left, right
		var ctor = self:constructor
		ctor.new(op,left,right)

	def js
		var raw = null
		var rgt = right

		# is this right? Should not the index compile the brackets
		# or value is a symbol -- should be the same, no?
		# messy
		if rgt isa AST.Index and (rgt.value isa AST.Str or rgt.value isa AST.Symbol)
			rgt = rgt.value
			# hmm

		# 	if rgt isa AST.Str
		# 		if rgt.value.isValidIdentifier
		# 			raw = rgt.value.raw
		# 		else
		# 			rgt = rgt.value

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
			return "{ctx.c}[{rgt.c}]"

	def visit
		# really?
		left.traverse if left
		right.traverse if right

	def isExpressable
		yes # ?
		# !right || right.isExpressable

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
		# if safechain
		# 	"{right.c} != null"
		# else
		if right isa AST.Variable and right.type == 'meth'
			# p "method-variable access(!)"
			return "{right.c}()" unless up isa AST.Call # (up isa AST.Call ? "" : "()")

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

		var js = "{super}"
		js += "()" unless (up isa AST.Call or up isa AST.Util.IsFunction)
		return js

		# return "{super}" + (up isa AST.Call ? "" : "()")

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
		# if it is forced, cache the whole shebang
		return super if o:force
		right.cache
		self


class AST.SuperAccess < AST.Access

	def js o
		var m = o.method
		var out = null
		var up = o.parent
		var deep = o.parent isa AST.Access

		# TODO optimization for later - problematic if there is a different reference in the end
		if false && m && m.type == :constructor
			out = "{left.c}.superclass"
			out += ".apply({m.scope.context.c},arguments)" unless deep
			throw "not implemented!!"
		else
			out = "{left.c}.__super"
			unless up isa AST.Access
				out += ".{m.supername.c}"
				unless up isa AST.Call # autocall?
					out += ".apply({m.scope.context.c},arguments)"

			# out += ".{m.supername.c}.apply({m.scope.context.c},arguments)" unless deep

		return out

	def receiver
		AST.SELF

# can be other things as well? Possibly break / continue statements
class AST.VarOrAccess < AST.ValueNode

	def visit

		@identifier = value

		var scope = scope__
		var variable = scope.lookup(value)

		if variable && variable.declarator
			# p "found local variable"
			# unclear how we should do the referencing etc
			variable.addReference(self) # hmm
			# this is auto-calling
			# if variable.type == 'meth'
			# 	p "VarOrAccess autocall"
			# 	self.value = AST.PropertyAccess.new(".",variable.scope,variable)
			# else
			self.value = variable.accessor(self)
			self.value.safechain = safechain # hmm

			

		# hack much
		elif value.symbol.indexOf('$') >= 0
			self.value = AST.GlobalVarAccess.new(value)
		else
			# scope context? -- maybe let it be implicit?
			# scope.context,
			self.value = AST.PropertyAccess.new(".",scope.context,value)

		@value.traverse

	def c
		value.c

	def node
		value

	def symbol
		value and value.symbol

	def cache o = {}
		# this is the 
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
		# unless loc
		# 	console.log "did not find loc! {@identifier}"
		return loc or [0,0]

	def toString
		"VarOrAccess({value})"

# var name
class AST.VarReference < AST.ValueNode

	# TODO VarBlock should convert these to plain / dumb nodes

	prop variable

	def js o
		# experimental fix
		
		var ref = @variable
		var out = ref.c
		# p "no variable?! {STACK} {ref.c}".red

		if ref && !ref.option(:declared)
			if o.up(AST.VarBlock)
				ref.set(declared: yes)
			elif o.isExpression or option(:export) # why?
				# p "FORCE VARIABLE DECLARE {out}".red
				# TODO
				ref.autodeclare
				# ref.autodeclare # predeclare in scope
			else
				out = "var {out}"
				ref.set(declared: yes)

		

		# need to think the export through -- like registering somehow
		# should register in scope - export on analysis++
		# this is far from production-ready
		if option(:export)
			# hmmmm
			out = "module.exports.{ref.c} = {ref.c}"

		# if option(:export)
		# 	# p "option.export for var"
		# 	# this is NOT good
		# 	out = [out,"module.exports.{ref.c} = {ref.c}"] 
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

		if option(:export)
			self
			# should only allow in the top-scope, no?
			# self.variable.export = yes
		self

	def refnr
		variable.references.indexOf(value)

	# convert this into a list of references
	def addExpression expr
		# p "{self} <- {expr}"
		AST.VarBlock.new([self]).addExpression(expr)
