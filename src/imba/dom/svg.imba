var Imba = require("../imba")

tag svg:element

	def self.namespaceURI
		"http://www.w3.org/2000/svg"

	def self.buildNode
		var dom = Imba.document.createElementNS(namespaceURI,@nodeType)
		var cls = @classes.join(" ")
		dom:className:baseVal = cls if cls
		dom

	def self.inherit child
		child.@protoDom = null

		if child.@name in Imba.SVG_TAGS
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

tag svg:g

tag svg:defs

tag svg:symbol
	attr preserveAspectRatio inline: no
	attr viewBox inline: no

tag svg:marker
	attr markerUnits inline: no
	attr refX inline: no
	attr refY inline: no
	attr markerWidth inline: no
	attr markerHeight inline: no
	attr orient inline: no

# Basic shapes

tag svg:rect
	attr rx inline: no
	attr ry inline: no

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

tag svg:polyline
	attr points inline: no

tag svg:polygon
	attr points inline: no

tag svg:text
	attr dx inline: no
	attr dy inline: no
	attr text-anchor inline: no
	attr rotate inline: no
	attr textLength inline: no
	attr lengthAdjust inline: no

tag svg:tspan
	attr dx inline: no
	attr dy inline: no
	attr rotate inline: no
	attr textLength inline: no
	attr lengthAdjust inline: no