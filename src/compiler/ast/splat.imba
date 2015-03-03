
# Move somewhere else?
class AST.Splat < AST.ValueNode

	def js
		var par = stack.parent
		if par isa AST.Arr
			"[].slice.call({value.c})"
		else
			"SPLAT"

	# def visit
	# 	p "visit splat {value}"
	# 	value.traverse

	def node
		value
		