
tag svg:svgelement

	def self.namespaceURI
		"http://www.w3.org/2000/svg"

	let types = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ")

	def self.buildNode
		var dom = Imba.document.createElementNS(namespaceURI,@nodeType)
		var cls = @classes.join(" ")
		dom:className = cls if cls
		dom

	def self.inherit child
		console.log 'svg inherit',child
		child.@protoDom = null

		if child.@name in types
			child.@nodeType = child.@name
			child.@classes = []
		else
			child.@nodeType = @nodeType
			var className = "_" + child.@name.replace(/_/g, '-')
			child.@classes = @classes.concat(className)


	attr x
	attr y

tag svg:svg
	attr viewbox
	attr width
	attr height

tag svg:rect
	attr width
	attr height

tag svg:circle
	attr cx
	attr cy
	attr r

tag svg:ellipse
	attr cx
	attr cy
	attr rx
	attr ry
