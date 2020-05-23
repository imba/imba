class ElementRoute
	def constructor node, path, parent
		node = node
		route = node.router.routeFor(node,path,parent ? parent.route : null,{node: node})
		match = null
		placeholder = node.$placeholder or Comment.new("{path}")

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
				self.match = match

			if match != prev or !active or (match.url != prevUrl)
				node..routeDidResolve(match,prev,prevUrl)

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
			# should base this on a modifier
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
			if !e.altKey and !e.metaKey
				e.preventDefault()
				router.go($route.route.resolve!)
		self

	def end$routed
		if $route
			$route.resolve()
			return unless $route.isActive()
		
		visit() if visit

	def end$routeTo
		if $route
			let match = $route.route.test()
			let href = $route.route.resolve()
			setAttribute('href',href)
			flags.toggle('active',!!match)
			
		visit() if visit

	def routeDidEnter route
		self.flags.add('routed')
		let ph = route.placeholder
		if ph.parentNode and ph != self
			ph.replaceWith$(self)

	def routeDidLeave route
		self.flags.remove('routed')
		let ph = route.placeholder
		if parentNode and ph != self
			self.replaceWith$(ph)
		self

	def routeDidResolve params, prev
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

