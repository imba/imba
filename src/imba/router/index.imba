# imba$runtimez=local

let routerInstance = null

import {EventEmitter} from 'events'
import {Node,Element,Document,createComment} from '../dom/core'
import {Location} from './location'
import {History} from './history'
import {Request} from './request'
import {Route,RootRoute} from './route'
import {commit,scheduler} from '../scheduler'
import {proxy} from '../utils'
import {Queue} from '../queue'

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
		#routes = {}
		aliases = {}
		redirects = {}
		rules = {}
		options = o
		busy = []
		#version = 0
		#doc = doc
		queue = new Queue
		web? = !!doc.defaultView
		root = o.root or ''
		rootRoute = new RootRoute(self)
		params = {}
		params.#cache = {}

		history = $web$ ? global.window.history : (new History(self))
		location = new Location(o.url or doc.location.href,self)
		mode = o.mode or 'history'

		if $web$
			queue.on 'busy' do
				global.document.flags.incr('busy')
		
			queue.on 'idle' do
				global.document.flags.decr('busy')
				commit!

		self.setup!
		self

	get origin
		#origin ||= #doc.location.origin

	get query
		location.query

	def init
		refresh(mode: 'replace')
		self

	def alias from, to
		aliases[from] = to
		location.reparse!
		self

	def param key, loader
		params[key] = loader

	def load-params match
		let ctx = {}
		for own key,value of match
			if params[key]
				let cache = params.#cache[key]
				let res = await params[key](value,ctx,cache)
				params.#cache[key] = res
			else
				ctx[key] = value
		return ctx

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

	get ctx
		#request
		
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
		let prev = #request
		# console.log 'refreshing router',params,loc,mode,original
		# we need to compare with the previously stored location
		# also see if state is different?
		if !loc.equals(original) or !prev
			# console.log "actual url has changed!!",String(original),'to',String(loc)
			let req = new Request(self,loc,original)
			req.mode = mode
			#request = req
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
				# after each middleware - see if we have redirected or thrown anything?

				if mode == 'push'
					self.pushState(params.state or self.state,null,String(location))
				elif mode == 'replace' # params.replace
					self.replaceState(params.state or self.state,null,String(location))
					
				if $web$
					location.state = global.window.history.state
					
				self.emit('change',req)
				#version++
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

			refresh
		self
		
	def onclick e
		

		let a = null
		let r = null
		
		let t = e.target
		
		while t
			if t.nodeName == 'A'
				a ||= t
			if t.#routeTo
				r ||= t
			t = t.parentNode
		
		console.log 'clicked??',t,a,r
		return if e.metaKey or e.altKey

		if a and r != a and (!r or r.contains(a))
			
			let href = a.getAttribute('href')
			if href && !href.match(/\:\/\//) and !a.getAttribute('target') and !a.classList.contains('external')
				a.addEventListener('click',onclicklink.bind(self),once: true)
		yes
		
	def onclicklink e
		let a = e.currentTarget or e.target

		if a.#routeTo
			a.#routeTo.resolve!

		let href = a.getAttribute('href')
		let url = new URL(a.href)
		let target = url.href.slice(url.origin.length)
		let currpath = realpath.split('#')[0]
		let newpath = target.split('#')[0]

		# console.log 'clicklink',target,url,currpath,newpath
		# checking if we are only changing the hash here
		if currpath == newpath
			global.document.location.hash = url.hash
		elif a.#routeTo
			a.#routeTo.go!
		else
			self.go(target)

		e.stopPropagation()
		e.preventDefault()
	
	get path
		let path = location.path
		return aliases[path] or path

	get url
		return location.url
	
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
		let route = #routes[pattern] ||= new Route(self,pattern)
		route.test()
		
	def route pattern
		rootRoute.route(pattern)

		# let route = #routes[pattern] ||= new Route(self,pattern)
		# route

	def use url, handler
		let route = self.route(url)
		#middlewares.push([route,handler])

	def routeFor path, par, opts
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
			# remnants of old loading
			busy.length == 0 ? cb(self) : once('ready',cb)
		
# def emit name, ...params do imba.emit(self,name,params)
# def on name, ...params do imba.listen(self,name,...params)
# def once name, ...params do imba.once(self,name,...params)
# def un name, ...params do imba.unlisten(self,name,...params)

export class ElementRoute
	def constructor node, path, parent, options = {}
		self.parent = parent
		node = node
		#path = path
		# #route = self.router.routeFor(path,parent ? parent.route : null,options)
		#match = null
		#options = options
		#cache = {}
		#resolvedPath = null
		#activeKey = Symbol!
		#urlKey = Symbol!
		# #children = new Set

	def [Symbol.toPrimitive]
		#symbol ||= Symbol!

	get route
		let pr = parent ? parent.route : self.router
		pr.route(#path)

	get raw
		route.raw
	
	get match
		#match

	set path value
		if #path =? value
			console.log 'update the route?!?!',value
			router.#version++

	get router
		node.ownerDocument.router
		
	get sticky
		#options and #options.sticky
		
	get exact
		#options and #options.exact

	get isActive
		!!#active

	def resolve
		let prev = match
		
		let v = self.router.#version
		return unless #version =? v
			
		let r = route
		let o = #options
		let url = self.router.path
		let match = r.match(url)
		let shown = #active
		let last = #match
		console.log 'resolve real ElementRoute',r.raw,match
		let changed = match != #match
		let prevUrl = match and match[#urlKey]

		if match
			#active = true
			#match = match
			match[#urlKey] = url
			
		if match
			if changed or (prevUrl != url and o.sensitive)
				#resolved(match,last)

		if !shown and match
			#enter!

		if shown and !match
			# make inactive
			#active = false
			#leave!

		return #match

	def resolveOld

		let prevUrl = prev and prev.url
		let curr = route.test!

		if curr
			let active = prev and prev.#active # what if the previous was active?
			curr.#active = true

			if curr != prev
				self.#match = curr

			let loader = null

			if curr != prev or !active or (curr.url != prevUrl)
				#resolved(curr,prev,prevUrl)

			if !active
				#enter!
			
			return curr

		elif prev and prev.#active
			prev.#active = false
			#leave!
		elif !prev
			self.#match = prev = {}
			#leave!
		
		#resolved? = yes
		return prev

	def #enter
		node.flags.remove('not-routed')
		node.flags.add('routed')
		node..routeDidEnter(self)
		
	def #resolved match,prev,prevUrl = ''
		node..visit!
		node..routeDidResolve(match,prev,prevUrl)

	def #leave
		# replace flag?
		node.flags.add('not-routed')
		node.flags.remove('routed')
		node..routeDidLeave(self)

export class ElementRouteTo < ElementRoute
	
	def #enter
		self
		
	def #resolved
		self
		
	def #leave
		self

	def resolve
		let v = self.router.#version
		if #version =? v
			let o = #options
			let r = route
			let url = self.router.path
			let href = route.resolve(url)
			let match = route.match(url)

			if match
				#match = match
				#match[#urlKey] = url
	
			if o.sticky and #match
				href = #match[#urlKey]

			if #href =? href
				node.setAttribute('href',href) if node.nodeName == 'A'

			node.flags.toggle('active',!!match)
		return
	
	def go
		resolve!

		if #options and #options.replace
			self.router.replace(#href)
		else
			self.router.go(#href)

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
		
		self.insertInto$ = do(parent)
			# should base this on a modifier
			parent.appendChild$(#route.isActive ? self : #placeholderNode)

	get route
		#route

	set route-to value
		if #routeTo
			if #routeTo.raw != value
				# console.log 'routeTo changed!!',value
				#routeTo.path = value
			return

		let par = value[0] != '/' ? parent-route : null
		#route = #routeTo = new ElementRouteTo(self,value,par,routeTo__)
		self.end$ = self.end$routeTo

		# really? shouldnt this be handled by the router instead??
		self.onclick = do(e)
			if !e.altKey and !e.metaKey and !e.#routeHandler
				e.preventDefault!
				e.#routeHandler = #routeTo
				#routeTo.go!

	def end$routed
		if #route
			#route.resolve!
			return unless #route.isActive
		
		visit! if visit

	def end$routeTo
		if #routeTo
			#routeTo.resolve!

		visit! if visit

	def routeDidEnter route
		#attachToParent!

	def routeDidLeave route
		#detachFromParent!

	def routeDidResolve match, prev
		if self.routed isa Function
			self.router.queue.add do
				let res = await self.routed(match,prev)
		return