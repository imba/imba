
def Imba.document
	window:document

###
Returns the body element wrapped in an Imba.Tag
###
def Imba.root
	tag(Imba.document:body)

tag htmlelement < element

	###
	Called when a tag type is being subclassed.
	###
	def self.inherit child
		child:prototype.@empty = yes
		child.@protoDom = null

		if @nodeType
			child.@nodeType = @nodeType

			var className = "_" + child.@name.replace(/_/g, '-')
			child.@classes = @classes.concat(className) unless child.@name[0] == '#'
		else
			child.@nodeType = child.@name
			child.@classes = []

	def self.buildNode
		var dom = Imba.document.createElement(@nodeType)
		var cls = @classes.join(" ")
		dom:className = cls if cls
		dom

	def self.createNode
		var proto = (@protoDom ||= buildNode)
		proto.cloneNode(false)

	def self.dom
		@protoDom ||= buildNode

	attr tabindex
	attr title
	attr role
	attr name

	def width
		@dom:offsetWidth

	def height
		@dom:offsetHeight

	def setChildren nodes, type
		@empty ? append(nodes) : empty.append(nodes)
		@children = null
		self
		
	def emit name, data: null, bubble: yes
		Imba.Events.trigger name, self, data: data, bubble: bubble
		return self

	def template
		null

tag svgelement < htmlelement
