import {Element} from '../dom/core'

export class ElementRoute
	def constructor node, path, parent, options = {}
		node = node
		route = imba.router.routeFor(node,path,parent ? parent.route : null,options)
		match = null
		options = options
		placeholder = node.$placeholder or new window.Comment("{path}")

	get raw
		route.raw

	set path value
		route.path = value

	get params
		match
		
	get sticky
		options and options.sticky
		
	get exact
		options and options.exact

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
		node.flags.remove('not-routed')
		node.flags.add('routed')
		node..routeDidEnter(self)
		
	def resolved match,prev,prevUrl
		node..routeDidResolve(match,prev,prevUrl)

	def leave
		# replace flag?
		node.flags.add('not-routed')
		node.flags.remove('routed')
		node..routeDidLeave(self)

export class ElementRouteTo < ElementRoute
	
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
		if sticky and match and !match.active
			href = match.url or href

		if options and options.replace
			imba.router.replace(href)
		else
			imba.router.go(href)

extend class Element

	get parent-route
		#context.route

	set route value
		if #route and #route.raw != value
			#route.path = value
			return

		let par = value[0] != '/' ? parent-route : null
		#route = new ElementRoute(self,value,par,route__)

		self.end$ = self.end$routed
		
		self.insertInto$ = do |parent|
			# should base this on a modifier
			parent.appendChild$(#route.isActive() ? self : #route.placeholder)

	get route
		#route

	set route-to value
		if #route
			if #route.raw != value
				#route.path = value
			return

		let par = value[0] != '/' ? parent-route : null
		#route = #routeTo = new ElementRouteTo(self,value,par,routeTo__)
		self.end$ = self.end$routeTo

		self.onclick = do(e)
			if !e.altKey and !e.metaKey
				e.preventDefault()
				#route.go!

	def end$routed
		if #route
			#route.resolve()
			return unless #route.isActive()
		
		visit() if visit

	def end$routeTo
		if #route
			
			let match = #route.resolve!
			let href = #route.url
			# let match = $route.route.test()
			
			if #route.sticky and match.url
				
				href = match.url

			setAttribute('href',href) if nodeName == 'A'
			flags.toggle('active',match and match.active or false)
			
		visit() if visit

	def routeDidEnter route
		let ph = route.placeholder
		if ph.parentNode and ph != self
			ph.replaceWith$(self)

	def routeDidLeave route
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

		#route.load do
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

