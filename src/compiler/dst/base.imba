

# set the base type?

tag ast
	
	prop raw dom: yes
	
	def append value
		value = value.dom if value isa AST.Node
		super.append(value)

tag ast-node < ast

	def build
		render(object)
		self

tag ast-expression < ast-node

tag ast-value-node < ast-node

	def template
		object.value

# tag ast-literal < ast
# 	
# 	def build
# 		render(object)
# 		self
# 		
# 	def template
# 		object.value
