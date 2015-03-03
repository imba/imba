



tag ast-list-node < ast-node
	
	def template obj
		object.nodes.map(|n| n.dom )

tag ast-param-list < ast-list-node


tag ast-block < ast-list-node
	
	# def build
	# 	console.log "build block",object.nodes
	#	self
		
	def template obj
		# object.nodes.map(|n| <div.expr> ["&nbsp;&nbsp;&nbsp;&nbsp;",n.dom] )
		object.nodes.map(|n| n.dom )

tag ast-code < ast-node

	def template obj
		object.body.dom
		

tag ast-root < ast-code

tag ast-class-declaration < ast-code

	def template >
		<div.head>
			<ast.keyword> "class"
			<div> "&nbsp;"
			<div.classname> object.name.dom
			if object.superclass
				<div.superclass> object.superclass.dom
		object.body.dom


tag ast-func < ast-code
	flag 'func'

tag ast-lambda < ast-func

	def template >
		# <div.head>
		<ast-param-list[object.params]>
		object.body.dom

tag ast-method-declaration < ast-func
	
	flag 'func'

	def template >
		<div.head>
			<ast.keyword> "def"
			<div> "&nbsp;"
			<div.entity.name> object.name.dom
			<ast-param-list[object.params]>
		object.body.dom

tag ast-return < ast-node
	
	def template >
		<ast.keyword> "return"
		<div> "&nbsp;"
		<ast.value> object.value


tag ast-identifier < ast-node

	def template
		object.value

tag ast-const < ast-identifier




tag ast-op < ast-node

	prop op dom: yes

	def build
		op = object.op
		super.build

	def template >
		object.left
		<ast.op raw=object.op> object.op
		object.right


tag ast-call < ast-node
	
	def template >
		object.callee
		object.args

tag ast-arg-list < ast-list-node

tag ast-param < ast-node

	def template
		object.name

tag ast-required-param < ast-param

tag ast-named-param < ast-param

tag ast-block-param < ast-param

tag ast-splat-param < ast-param

tag ast-self < ast-value-node

	def template
		"self"

tag ast-local-var-access < ast-node

	def template
		object.variable

tag ast-access < ast-op

tag ast-property-access < ast-access

	def template >
		# what about the receiver?
		object.left
		<ast.op raw=object.op> object.op
		object.right

tag ast-index-access < ast-access
	
	def template >
		# what about the receiver?
		<ast.left> object.left
		<ast.right.brackets> object.right

tag ast-index < ast-value-node

tag ast-scope-context < ast-node

	def template
		"self"

tag ast-variable < ast-node
	def template
		object.name

tag ast-assign < ast-op

tag ast-var-reference < ast-node

	def template >
		<ast.keyword.var.rs> "var"
		object.value


