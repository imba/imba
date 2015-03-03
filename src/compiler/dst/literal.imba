tag ast-literal < ast-node

	def template
		object.value

tag ast-str < ast-literal
	flag 'str'

tag ast-num < ast-literal
	flag 'num'

tag ast-obj < ast-literal
	flag 'obj'

tag ast-arr < ast-literal
	flag 'arr'

	def template
		object.value.map(|v| v.dom)