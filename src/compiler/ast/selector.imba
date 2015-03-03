

class AST.Selector < AST.ListNode

	def add part, typ
		# p "select add!",part,typ
		push(part)
		self

	def query
		var str = ""
		var ary = []

		for item in nodes
			var val = item.c
			if val isa String
				str = "{str}{val}"
			# else
			# 	p "is not a string(!)"

		"'{str}'"
		# ary.push(str.quoted)
		# ary.c.join("+")

	def js o
		var typ = option(:type)
		# var scoped = typ == '%' or typ == '%%'
		# var all = typ == '$' or typ == '%'

		if typ == '%'
			"q$({query.c},{o.scope.context.c(explicit: yes)})" # explicit context
		elif typ == '%%'
			"q$$({query.c},{o.scope.context.c})"
		else 
			"q{typ}({query.c})"

		# return "{typ} {scoped} - {all}"
		

class AST.SelectorPart < AST.ValueNode

	def c
		"{value.c}"

class AST.SelectorType < AST.SelectorPart

	def c
		# support
		# p "selectortype {value}"
		# var out = value.c
		var name = value.name
		# hmm - what about svg? do need to think this through.
		# at least be very conservative about which tags we
		# can drop the tag for?
		# out in TAG_TYPES.HTML ? 
		name in TAG_TYPES.HTML ? name : value.sel


class AST.SelectorUniversal < AST.SelectorPart

class AST.SelectorNamespace < AST.SelectorPart

class AST.SelectorClass < AST.SelectorPart

	def c
		".{value.c}"

class AST.SelectorId < AST.SelectorPart

	def c
		"#{value.c}"

class AST.SelectorCombinator < AST.SelectorPart

	def c
		"{value}"

class AST.SelectorPseudoClass < AST.SelectorPart

class AST.SelectorAttribute < AST.SelectorPart

	# remember to visit nodes inside here?
	def initialize left,op,right
		@left = left
		@op = op
		@right = @value = right

	def c
		# TODO possibly support .toSel or sel$(v) for items inside query
		# could easily do it with a helper-function that is added to the top of the filescope
		if @right isa AST.Str
			"[{@left.c}{@op}{@right.c}]"
		elif @right
			# this is not at all good
			"[{@left.c}{@op}\"'+{@right.c}+'\"]"
		else
			"[{@left.c}]"
		
			# ...
		

		