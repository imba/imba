
tag svg:svgelement

	def self.namespaceURI
		"http://www.w3.org/2000/svg"

	let types = "circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ")

	def self.buildNode
		var dom = Imba.document.createElementNS(namespaceURI,@nodeType)
		var cls = @classes.join(" ")
		dom:className:baseVal = cls if cls
		dom

	def self.inherit child
		child.@protoDom = null

		if child.@name in types
			child.@nodeType = child.@name
			child.@classes = []
		else
			child.@nodeType = @nodeType
			var className = "_" + child.@name.replace(/_/g, '-')
			child.@classes = @classes.concat(className)


	attr x inline: no
	attr y inline: no

	attr width inline: no
	attr height inline: no

	attr stroke inline: no
	attr stroke-width inline: no

tag svg:svg
	attr viewbox inline: no

tag svg:rect

tag svg:circle
	attr cx inline: no
	attr cy inline: no
	attr r inline: no

tag svg:ellipse
	attr cx inline: no
	attr cy inline: no
	attr rx inline: no
	attr ry inline: no

tag svg:path
	attr d inline: no
	attr pathLength inline: no

tag svg:line
	attr x1 inline: no
	attr x2 inline: no
	attr y1 inline: no
	attr y2 inline: no
