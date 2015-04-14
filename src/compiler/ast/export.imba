

class AST.ExportStatement < AST.ValueNode

	def js
		yes
		var nodes = @value.map do |arg|
			"module.exports.{arg.c} = {arg.c};\n"
		nodes.join("")