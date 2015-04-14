class AST.ImportStatement < AST.Statement


	prop ns
	prop imports
	prop source


	def initialize imports, source, ns
		@imports = imports
		@source = source
		@ns = ns
		self


	def visit
		if @ns
			@nsvar ||= scope__.register(@ns,self)
		self


	def js
		var req = CALL(AST.Identifier.new("require"),[source])

		if @ns
			# must register ns as a real variable
			return "var {@nsvar.c} = {req.c}"
		elif @imports

			# create a require for the source, with a temporary name?
			var out = [req.cache.c]

			for imp in @imports
				# we also need to register these imports as variables, no?
				var o = OP('=',imp,OP('.',req,imp))
				out.push("var {o.c}")

			return out
		else
			return req.c



	def consume node
		return self

