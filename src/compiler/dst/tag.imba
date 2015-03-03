

tag ast-tag < ast-expression
	
	def build
		console.log object.option(:type)
		console.log object.@parts
		super
		self

	def append value
		console.log "ast-tag appending value {value}"
		super
		

	def template >
		# this is not rendering with virtual dom
		<ast.head>
			<ast.type> object.option(:type)
			object.parts # render to classes - no?
		<ast.body> object.option(:body) # hmm

tag ast-tag-body < ast-list-node

tag ast-tag-type-identifier < ast-value-node

	def template
		object.value

tag ast-tag-flag < ast-literal

	def template
		console.log "AST-TAG-FLAG",object.value
		object.value

tag ast-tag-attr < ast-node

	def template >
		<div.key> object.key
		object.value