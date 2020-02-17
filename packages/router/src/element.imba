# import Route from './route'

class ElementRoute
	def constructor node, path, parent
		@node = node
		@route = node.router.routeFor(node,path,parent ? parent.route : null,{node: node})
		@match = null
		@placeholder = Comment.new("{path}")

	get raw
		@route.raw

	set path value
		@route.path = value

	get params
		@match

	def isActive
		@match && @match.active

	def resolve
		let prev = @match
		let prevUrl = prev and prev.url
		let match = @route.test()

		console.log 'resolving route?',@raw,match,prev
		if match
			let active = match.active # what if the previous was active?
			match.active = true

			if match != prev
				@match = match

			if match != prev or !active or (match.url != prevUrl)
				@node?.routeDidResolve(match,prev)

			if !active
				@enter()

		elif prev and prev.active
			prev.active = false
			@leave()
		elif !prev
			@match = {}
			@leave()

	def enter 
		@node?.routeDidEnter(self)

	def leave
		@node?.routeDidLeave(self)


extend class Element

	#	set router value
	#		#router = value
	#
	#	get router
	#		if $web$
	#			# router instance
	#			yes
	#		#router ||= #context.router

	get route
		#route

	get parent-route
		#context.route

	set route value
		if #route and #route.raw != value
			#route.path = value
			return

		let par = value[0] != '/' ? @parent-route : null
		#route = ElementRoute.new(self,value,par,{node: self})
		console.log 'setting route!',value,#route,par
		self.end$ = self.end$routed
		self.insertInto$ = do |parent|
			parent.appendChild$(#route.isActive() ? self : #route.placeholder)

		# #route = value

	set route-to path
		# console.log 'set route to',path,@router
		self.onclick = do |e|
			e.preventDefault()
			console.log 'go to path!!',path
			@router.go(path)
		self

	def end$routed
		# console.log 'end routed!',self
		if #route
			#route.resolve()

			return unless #route.isActive()

		self.render() if self.render

	def routeDidEnter route
		console.log 'routeDidEnter'
		if route.placeholder.parentNode
			route.placeholder.replaceWith$(self)


	def routeDidLeave route
		# console.log 'routeDidLeave',@parentNode,route.placeholder
		if @parentNode
			self.replaceWith$(route.placeholder)
		self


	# def setRouteTo path, mods
	# 	if @route
	# 		self.setRoute(path)
	# 	else
	# 		mods ||= {}
	# 		mods.link = true
	# 		self.setRoute(path,mods)