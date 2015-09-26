def Imba.static items, nr
	items:static = nr
	return items

export class ElementTag
	prop object

	def dom
		@dom

	def initialize dom
		self.dom = dom
		self
		
	def setDom dom
		dom.@tag = self
		@dom = dom
		self

	def setRef ref
		flag(@ref = ref)
		self

	def setHandler event, handler, ctx
		var key = 'on' + event

		if handler isa Function
			self[key] = handler
		elif handler isa Array
			var fn = handler.shift
			self[key] = do |e| ctx[fn].apply(ctx,handler.concat(e))
		else
			self[key] = do |e| ctx[handler](e)
		self

	def id= id
		dom:id = id
		self

	def id
		dom:id

	def setAttribute key, new
		var old = dom.getAttribute(key)

		if old == new
			new
		elif new != null && new !== false
			dom.setAttribute(key,new)
		else
			dom.removeAttribute(key)

	def removeAttribute key
		dom.removeAttribute(key)

	def getAttribute key
		dom.getAttribute(key)

	def content= content
		children = content
		self

	def children= nodes
		throw "Not implemented"

	def text v
		throw "Not implemented"

	def text= txt
		throw "Not implemented"

	def dataset key, val
		throw "Not implemented"

	# bind / present
	# should deprecate / remove
	def bind obj
		object = obj
		self

	def render
		self

	def build
		render
		self

	def commit
		render
		self

	def end
		if @built
			commit
		else
			@built = yes
			build
		self

	# called whenever a node has rendered itself like in <self> <div> ...
	def synced
		self

	# called when the node is awakened in the dom - either automatically
	# upon attachment to the dom-tree, or the first time imba needs the
	# tag for a domnode that has been rendered on the server
	def awaken
		self

	def flag ref, toggle
		throw "Not implemented"

	def self.createNode
		throw "Not implemented"

ElementTag:prototype:initialize = ElementTag


