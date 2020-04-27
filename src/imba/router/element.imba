class ElementRoute
	def constructor node, path, parent
		node = node
		route = node.router.routeFor(node,path,parent ? parent.route : null,{node: node})
		match = null
		placeholder = Comment.new("{path}")

	get raw
		route.raw

	set path value
		route.path = value

	get params
		match

	def isActive
		match && match.active

	def resolve
		let prev = match
		let prevUrl = prev and prev.url
		let match = route.test()

		# console.log 'resolving route?',raw,match,prev
		if match
			let active = match.active # what if the previous was active?
			match.active = true

			if match != prev
				match = match

			if match != prev or !active or (match.url != prevUrl)
				console.log 'routeDidResolve!',match,prev
				node..routeDidResolve(match,prev)

			if !active
				enter()

		elif prev and prev.active
			prev.active = false
			leave()
		elif !prev
			match = {}
			leave()

	def enter 
		node..routeDidEnter(self)

	def leave
		node..routeDidLeave(self)


extend class Element

	#	set router value
	#		$router = value
	#
	#	get router
	#		if $web$
	#			# router instance
	#			yes
	#		$router ||= $context.router

	get route
		$route

	get parent-route
		$context.route

	set route value
		if $route and $route.raw != value
			$route.path = value
			return

		let par = value[0] != '/' ? parent-route : null
		$route = ElementRoute.new(self,value,par,{node: self})
		# console.log 'setting route!',value,$route,par
		self.end$ = self.end$routed
		self.insertInto$ = do |parent|
			parent.appendChild$($route.isActive() ? self : $route.placeholder)

		# $route = value

	set route-to value
		if $route
			if $route.raw != value
				$route.path = value
			return

		let par = value[0] != '/' ? parent-route : null
		$route = ElementRoute.new(self,value,par,{node: self})
		self.end$ = self.end$routeTo

		self.onclick = do(e)
			e.preventDefault()
			# console.log 'go to path!!',value
			router.go($route.route.resolve!)
		self

	def end$routed
		# console.log 'end routed!',self
		if $route
			$route.resolve()
			return unless $route.isActive()
		
		visit() if visit

	def end$routeTo
		if $route
			# console.log "ended with route to"
			# only if some part of routing has changed
			let match = $route.route.test()
			let href = $route.route.resolve()
			# console.log match,href
			setAttribute('href',href)
			flags.toggle('active',!!match)
			
		visit() if visit

	def routeDidEnter route
		# console.log 'routeDidEnter'
		if route.placeholder.parentNode
			route.placeholder.replaceWith$(self)

	def routeDidLeave route
		# console.log 'routeDidLeave',parentNode,route.placeholder
		if parentNode
			self.replaceWith$(route.placeholder)
		self

	def routeDidResolve params, prev
		# console.log 'resolved?'
		return
		if !self.load or (params == prev and !self.reload)
			self..routeDidMatch(params)
			self..routeDidLoad(params,prev)
			return self

		$route.load do
			self.routeDidMatch(params)
			let val
			try
				if params != prev
					val = await self.load(params,prev)
				elif self.reload
					val = await self.reload(params,prev)
			catch e
				# log "route error",e
				val = 400
				self.routeDidFail(e)
			self.routeDidLoad(val)
			return val

		return self

