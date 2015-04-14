
class AST.Op < AST.Node

	prop op
	prop left
	prop right

	def initialize o, l, r 
		@invert = no
		self.op = o
		self.left = l
		self.right = r

	def visit
		@right.traverse if @right
		@left.traverse if @left

	def isExpressable
		!right || right.isExpressable

	def js
		var out = null
		var op = self.op

		# if @invert
		#	p "op is inverted!!!"

		if left && right
			out = "{left.c} {op} {right.c}"
		elif left
			out = "{op}{left.c}"
		# out = out.parenthesize if up isa AST.Op # really?
		out

	def shouldParenthesize
		option(:parens)

	def precedence
		10

	def consume node
		# p "Op.consume {node}".cyan
		return super if isExpressable

		# TODO can rather use global caching?
		var tmpvar = scope__.declare(:tmp,null,system: yes)
		var clone = OP(op,left,null)
		var ast = right.consume(clone)
		ast.consume(node) if node
		return ast

class AST.ComparisonOp < AST.Op

	def invert
		var op = self.op
		var pairs = [ "==","!=" , "===","!==" , ">","<=" , "<",">=" ]
		var idx = pairs.indexOf(op)
		idx += (idx % 2 ? -1 : 1)

		# p "inverted comparison(!) {idx} {op} -> {pairs[idx]}"
		self.op = pairs[idx]
		@invert = !@invert
		self

	def c
		if left isa AST.ComparisonOp
			left.right.cache
			OP('&&',left,OP(op,left.right,right)).c
		else
			super

		
class AST.MathOp < AST.Op
	# BUG if we have a statement in left or right we need
	# to FORCE it into an expression, and register warning
	# should not at all consume anything like a regular Op
	def c
		if op == '∪'
			return util.union(left,right).c
		elif op == '∩'
			return util.intersect(left,right).c


class AST.UnaryOp < AST.Op

	def invert
		if op == '!'
			return left
		else
			super # regular invert

	def js
		# all of this could really be done i a much
		# cleaner way.
		left.set(parens: yes) if left
		right.set(parens: yes) if right

		if op == '!'
			left.set(parens: yes)
			"{op}{left.c}"

		elif op == '√'
			"Math.sqrt({left.c})"

		elif left
			"{left.c}{op}"

		else
			"{op}{right.c}"

	def normalize
		return self if op == '!' or op == '√'
		var node = (left || right).node
		# for property-accessors we need to rewrite the ast
		return self unless node isa AST.PropertyAccess

		# ask to cache the path
		node.left.cache if node isa AST.Access && node.left

		var num = AST.Num.new(1)
		var ast = OP('=',node,OP(op[0],node,num))
		ast = OP(op[0] == '-' ? '+' : '-',ast,num) if left

		return ast

	def consume node
		var norm = normalize
		norm == self ? super : norm.consume(node)

	def c
		var norm = normalize
		norm == self ? super : norm.c

class AST.InstanceOf < AST.Op

	def js o
		# fix checks for String and Number
		# p right.inspect

		if right isa AST.Const
			# WARN otherwise - what do we do? does not work with dynamic
			# classes etc? Should probably send to utility function isa$
			var name = right.value
			var obj = left.node
			# TODO also check for primitive-constructor
			if name in ['String','Number','Boolean']
				unless obj isa AST.LocalVarAccess
					obj.cache
				# need a double check for these (cache left) - possibly
				return "(typeof {obj.c}=='{name.toLowerCase}'||{obj.c} instanceof {name})"
			
				# convert
		var out = "{left.c} {op} {right.c}"
		out = out.parenthesize if o.parent isa AST.Op
		out

class AST.TypeOf < AST.Op

	def js
		"typeof {left.c}"

class AST.Delete < AST.Op

	def js
		# TODO this will execute calls several times if the path is not directly to an object
		# need to cache the receiver
		var tmp = scope__.temporary(self, type: 'val')
		var ast = [OP('=',tmp,left),"delete {left.c}",tmp]
		ast.c # .parenthesize # should really force parenthesis here, no?
		# left.cache # first deleting the value?
		# "({left.c},delete {left.c}"

	def shouldParenthesize
		yes

class AST.In < AST.Op

	def invert
		@invert = !@invert
		self

	def js
		var cond = @invert ? "== -1" : ">= 0"
		var idx = AST.Util.indexOf(left,right)
		"{idx.c} {cond}"
		
		