# imba$runtimez=local

let routerInstance = null

import {EventEmitter} from 'events'
import {Node,Element,Document,createComment} from './dom/core'
import {Location} from './router/location'
import {History} from './router/history'
import {Request} from './router/request'
import {Route} from './router/route'
import {commit,scheduler} from './scheduler'
import {proxy} from './utils'

# import './router/element'
extend class Document
	get router
		#router ||= new Router(self)

export def use_router
	yes

export const router = proxy do
	global.document.router

export class Router < EventEmitter

	# support redirects
	def constructor doc, o = {}
		super()
		routes = {}
		aliases = {}
		redirects = {}
		options = o
		busy = []
		#doc = doc
		web? = !!doc.defaultView
		root = o.root or ''
		history = $web$ ? global.window.history : (new History(self))
		location = new Location(o.url or doc.location.href,self)
		mode = o.mode or 'history'
		
		self.setup!
		self

	get origin
		#origin ||= #doc.location.origin
	
	def init
		self

	def alias from, to
		aliases[from] = to
		location.reparse!
		self

	def option key, value
		if value == undefined
			return options[key]
		else
			options[key] = value
		return self
		
	get realpath
		if $web$
			let loc = #doc.location
			return loc.href.slice(loc.origin.length)
		return location.path

	get state
		{}
		
	def pushState state, title, url
		history.pushState(state,title or null,String(url))
	
	def replaceState state, title, url
		history.replaceState(state,title or null,String(url))

	# called whenever the location might have changed for some reason
	def refresh params = {}
		return if refreshing
		refreshing = yes

		let original = location
		let loc = Location.parse(params.location or realpath,self)
		let mode = params.mode
		# console.log 'refreshing router',params,loc,mode,original
		# we need to compare with the previously stored location
		# also see if state is different?
		if !loc.equals(original)
			# console.log "actual url has changed!!",String(original),'to',String(loc)
			let req = new Request(self,loc,original)
			req.mode = mode
			
			self.emit('beforechange',req)

			if req.aborted
				# console.log "request was aborted",params
				# what about silent abort?
				let res = !req.forceAbort && global.window.confirm("Are you sure you want to leave? You might have unsaved changes")

				if res
					req.aborted = no
				# if we don't confirm, push the previous state again
				elif mode == 'pop' # params:pop
					self.pushState(self.state,null,String(original))
				elif mode == 'replace' # mode != 'push' # !params:push
					self.replaceState(self.state,null,String(original))

				# if we're not popping - should happen before we are changing

			unless req.aborted
				location = req.location

				if mode == 'push'
					self.pushState(params.state or self.state,null,String(location))
				elif mode == 'replace' # params:replace
					self.replaceState(params.state or self.state,null,String(location))
					
				if $web$
					location.state = global.window.history.state
					
				self.emit('change',req)
				commit!
		
		$web$ and self.onReady do
			let hash = #doc.location.hash
			if hash != #hash
				self.emit('hashchange',#hash = hash)

		refreshing = no
		self
	
	def onpopstate e
		self.refresh(pop: yes, mode: 'pop')
		self

	def onbeforeunload e
		let req = new Request(self,null,location)
		self.emit('beforechange',req)
		return true if req.aborted
		return
		
	def onhashchange e
		emit('hashchange',#hash = #doc.location.hash)
		commit!

	def setup
		if $web$
			onclick = onclick.bind(self)
			onhashchange = onhashchange.bind(self)
			
			#hash = #doc.location.hash
			location = Location.parse(realpath,self)
			history.replaceState(self.state,null,String(location))

			window.onpopstate = self.onpopstate.bind(self) # do |e| onpopstate(e)
			window.onbeforeunload = self.onbeforeunload.bind(self)

			window.addEventListener('hashchange',onhashchange)
			window.addEventListener('click',onclick,capture: yes)
		self
		
	def onclick e
		return if e.metaKey or e.altKey

		let a = null
		let r = null
		
		let t = e.target
		
		while t
			if t.nodeName == 'A'
				a ||= t
			if t.#routeTo
				r ||= t
			t = t.parentNode

		if a and r != a and (!r or r.contains(a))
			let href = a.getAttribute('href')
			if href && !href.match(/\:\/\//) and !a.getAttribute('target') and !a.classList.contains('external')
				a.addEventListener('click',onclicklink.bind(self),once: true)
		yes
		
	def onclicklink e
		let a = e.currentTarget or e.target
		let href = a.getAttribute('href')
		let url = new URL(a.href)
		let target = url.href.slice(url.origin.length)
		let currpath = realpath.split('#')[0]
		let newpath = target.split('#')[0]

		# console.log 'clicklink',target,url,currpath,newpath
		# checking if we are only changing the hash here
		if currpath == newpath
			global.document.location.hash = url.hash
		else
			self.go(target)

		e.stopPropagation()
		e.preventDefault()
	
	get path
		let path = location.path
		return aliases[path] or path

	get url
		return location.url
	
	def query par,val
		if par == undefined
			return location.searchParams()
		else
			return location.query(par,val)
		
	get hash
		#hash

	def serializeParams params
		if params isa Object
			let value = for own key,val of params
					[key,global.encodeURI(val)].join("=")
			return value.join("&")
		return params or ''

	set hash value
		if $web$
			history.replaceState({},null,'#' + self.serializeParams(value)) # last state?
			# location:hash = serializeParams(value)
		
	def match pattern
		let route = routes[pattern] ||= new Route(self,pattern)
		route.test()
		
	def route pattern
		routes[pattern] ||= new Route(self,pattern)

	def routeFor node, path, par, opts
		new Route(self,path,par,opts)
		
	def go url, state = {}
		let loc = location.clone().update(url,state)
		self.refresh(push: yes, mode: 'push', location: loc, state: state)
		self
		
	def replace url, state = {}
		let loc = location.clone().update(url,state)
		self.refresh(replace: yes, mode: 'replace', location: loc, state: state)
		# history.replaceState(state,null,normalize(url,state))
		# refresh
		
	def normalize url
		if self.mode == 'hash'
			url = "#{url}"
		elif self.root()
			url = self.root() + url
		return url
		
	def onReady cb
		scheduler.add do
			busy.length == 0 ? cb(self) : once('ready',cb)
		
# def emit name, ...params do imba.emit(self,name,params)
# def on name, ...params do imba.listen(self,name,...params)
# def once name, ...params do imba.once(self,name,...params)
# def un name, ...params do imba.unlisten(self,name,...params)

export class ElementRoute
	def constructor node, path, parent, options = {}
		node = node
		route = self.router.routeFor(node,path,parent ? parent.route : null,options)
		match = null
		options = options
		placeholder = node.$placeholder or createComment("{path}")

	get raw
		route.raw

	set path value
		route.path = value

	get params
		match

	get router
		node.ownerDocument.router
		
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
			self.router.replace(href)
		else
			self.router.go(href)

extend class Node
	get router
		ownerDocument.router

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
