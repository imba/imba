
class Router
	
	# support redirects
	def initialize
		self
	
var ROUTER = Router.new

class Route
	prop raw

	def initialize str, options = {}
		@options = options
		@pattern = @raw = str
		@groups = []
		@params = {}
		console.log "init route",self
		str = str.replace(/\:(\w+)/g) do |m,id|
			@groups.push(id)
			self[id] = do @params[id]
			return "([^\/]*)"

		str = '^' + str
		str += '$' if @options:exact
		@regex = RegExp.new(str)
		console.log @pattern,@regex

	def test_
		var url = document:location:hash.slice(1)
		if @regex
			let match = url.match(@regex)

			if match
				for item,i in match
					if let name = @groups[i - 1]
						@params[name] = self[name] = item
						
			return match
		return yes

extend tag element
	prop route watch: yes
	prop params

	# def routeDidSet route
	# 	console.log "did set route",route
	# 	setupRouting
		
	def setRoute route, mods
		if route != @route
			if !@route or @route.raw != route
				@route = Route.new(route,mods)
				setupRouting
		self
		
	def setupRouting
		return if @routedRender
		@routedRender = self:render

		self:render = do
			if !@route or @route.test_
				attachToParent
				@routedRender.call(self)
			else
				detachFromParent
		self
		
	def router
		ROUTER
		
	def routed
		self
	
	def unrouted
		self

