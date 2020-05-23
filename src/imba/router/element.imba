class ElementRoute
	def constructor node, path, parent, options
		node = node
		route = node.router.routeFor(node,path,parent ? parent.route : null,{node: node})
		match = null
		options = options
		placeholder = node.$placeholder or Comment.new("{path}")

	get raw
		route.raw

	set path value
		route.path = value

	get params
		match
		
	get sticky
		options and options.sticky

	def isActive
		match && match.active

	def resolve
		let prev = match
		let prevUrl = prev and prev.url
		let curr = route.test!

		# console.log 'resolving route?',raw,match,prev
		if curr
			let active = prev and prev.active # what if the previous was active?
			curr.active = true

			if curr != prev
				self.match = curr

			if curr != prev or !active or (curr.url != prevUrl)
				resolved(curr,prev,prevUrl)

			if !active
				enter()
			
			return curr

		elif prev and prev.active
			prev.active = false
			leave()
		elif !prev
			self.match = prev = {}
			leave()
			
		return prev

	def enter 
		node..routeDidEnter(self)
		
	def resolved match,prev,prevUrl
		node..routeDidResolve(match,prev,prevUrl)

	def leave
		node..routeDidLeave(self)

class ElementRouteTo < ElementRoute
	
	def enter
		self
		
	def resolve
		url = route.resolve!
		super
		
	def resolved
		self
		
	def leave
		self
	
	def go
		let href = route.resolve!
		if sticky and match
			href = match.url or href
		if options and options.replace
			node.router.replace(href)
		else
			node.router.go(href)
	

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
		$route = ElementRoute.new(self,value,par,route__)
		# console.log 'setting route!',value,$route,par
		self.end$ = self.end$routed
		
		self.insertInto$ = do |parent|
			# should base this on a modifier
			parent.appendChild$($route.isActive() ? self : $route.placeholder)


	set route-to value
		if $route
			if $route.raw != value
				$route.path = value
			return

		let par = value[0] != '/' ? parent-route : null
		$route = $routeTo = ElementRouteTo.new(self,value,par,routeTo__)
		self.end$ = self.end$routeTo

		self.onclick = do(e)
			if !e.altKey and !e.metaKey
				e.preventDefault()
				$route.go!
		

	def end$routed
		if $route
			$route.resolve()
			return unless $route.isActive()
		
		visit() if visit

	def end$routeTo
		if $route
			
			let match = $route.resolve!
			let href = $route.url # $route.route.resolve()	
			# let match = $route.route.test()
			
			if $route.sticky and match.url
				href = match.url

			setAttribute('href',href) if nodeName == 'A'
			flags.toggle('active',match and match.active or false)
			
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

