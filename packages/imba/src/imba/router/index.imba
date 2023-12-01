# imba$stdlib=1

let routerInstance = null

import {EventEmitter} from '../../../vendor/events'
$node$ import {Node,Element,Document} from '../dom/core'
import {Location} from './location'
import {History} from './history'
import {Request} from './request'
import {RootRoute} from './route'
import {commit,scheduler} from '../scheduler'
import {proxy} from '../utils'
import {Queue} from '../queue'



export def use_router
	global.imba.use_router = yes
	yes

export const router = proxy do
	global.document.router

export class Router < EventEmitter

	declare aliases
	declare redirects

	declare history\History

	# support redirects
	def constructor doc, o = {}
		super()
		#doc = doc
		#version = 0
		#routes = {}

		aliases = {}
		redirects = {}
		rules = {}
		matchers = {}
		options = o
		busy = []
		queue = new Queue
		root = new RootRoute(self)
		location = new Location(o.url or doc.location.href,self)
		history = new History(self)
		mode = o.mode or 'history'

		if $web$
			queue.on 'busy' do
				global.document.flags.incr('_routing_')

			queue.on 'idle' do
				global.document.flags.decr('_routing_')
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

	def touch
		#version++

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
		else
			return location.path

	get state
		history.state

	get states
		history.currentStates

	set state value
		if $web$
			state.data = value
			state.save!
		return

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

		# we need to compare with the previously stored location
		# also see if state is different?
		if !loc.equals(original) or !prev or params.state
			let req = new Request(self,loc,original,params)
			#request = req
			# include the state as well?
			self.emit('beforechange',req)

			if req.aborted
				let res = !req.forceAbort && global.window.confirm("Are you sure you want to leave? You might have unsaved changes")

				if res
					req.aborted = no
				# if we don't confirm, push the previous state again
				elif mode == 'pop'
					self.pushState(self.state,null,String(original))
				elif mode == 'replace' # mode != 'push' # !params:push
					self.replaceState(self.state,null,String(original))

				# if we're not popping - should happen before we are changing

			unless req.aborted
				location = req.location

				if mode == 'push'
					self.pushState(req.state,null,String(location))
				elif mode == 'replace'
					self.replaceState(req.state,null,String(location))
				elif mode == 'pop'
					self.history.index = params.index

				self.emit('change',req)
				touch!
				commit!

		if $web$
			scheduler.add do
				let hash = #doc.location.hash
				if hash != #hash
					self.emit('hashchange',#hash = hash)

		refreshing = no
		self

	def onpopstate e
		let from = history.index
		let to = from

		let params = {
			pop: yes
			index: 0
			from: from
			mode: 'pop'
		}
		try
			if typeof e.state == 'string'
				let [id,step] = e.state.split('|')
				to = params.index = parseInt(step)

				if to < from
					params.revert = history.slice(to + 1,from + 1).reverse!
				elif to > from
					params.apply = history.slice(from + 1,to + 1)

		self.refresh(params)
		self

	def onbeforeunload e
		let req = new Request(self,null,location,{mode: 'unload'})
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
			let win = global.window
			#hash = #doc.location.hash
			location = Location.parse(realpath,self)

			win.onpopstate = self.onpopstate.bind(self) # do |e| onpopstate(e)
			win.onbeforeunload = self.onbeforeunload.bind(self)

			win.addEventListener('hashchange',onhashchange)
			win.addEventListener('click',onclick,capture: yes)
			win.document.documentElement.emit('routerinit',self)
			refresh
		self

	def onclick e
		return if e.metaKey or e.altKey

		let a = null
		let r = null
		let t = e.target

		while t and (!a or !r)
			a = t if !a and t.nodeName == 'A'
			r = t if !r and t.#routeTo
			t = t.parentNode

		if a and r != a and (!r or r.contains(a))

			let href = a.getAttribute('href')
			if href && !href.match(/\:\/\//) and (!a.getAttribute('target') or a.getAttribute('target') == '_self') and !a.classList.contains('external')
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
		# checking if we are only changing the hash here
		if currpath == newpath
			global.document.location.hash = url.hash
		elif a.#routeTo
			a.#routeTo.go!
		else
			self.go(target)

		e.stopPropagation()
		e.preventDefault()

	get url
		return location.url

	get path
		let path = location.path
		return aliases[path] or path

	get pathname
		location.pathname

	def serializeParams params
		if params isa Object
			let value = for own key,val of params
					[key,global.encodeURI(val)].join("=")
			return value.join("&")
		return params or ''

	get hash
		#hash

	set hash value
		if $web$
			let val = '#' + self.serializeParams(value)
			global.history.replaceState(state,null,val)

	# See if router currently matches a pattern/path
	def match\any pattern\(string|RegExp)
		route(pattern).match(path)

	def route pattern
		root.route(pattern)

	def go url, state = null
		if typeof url == 'object' and state === null
			state = url
			url = path

		if typeof url == 'number'
			# now go
			global.history.go(url)
			return self

		let loc = location.clone().update(url)

		let action = history.buildState(state,loc.path,yes)
		self.refresh(push: yes, mode: 'push', location: loc, state: action, apply: [action])
		self

	def replace url, state = null
		if typeof url == 'object' and state === null
			state = url
			url = path

		let loc = location.clone().update(url)
		let action = history.buildState(state,loc.path,no)
		self.refresh(replace: yes, mode: 'replace', location: loc, state: action, apply: [action])

export class ElementRoute
	def constructor node, path, parent, options = {}
		self.parent = parent
		node = node
		#path = path
		#match = null
		#options = options
		#cache = {}
		#unmatched = {}
		#active = null
		#resolvedPath = null
		#dataKey = Symbol!
		#activeKey = Symbol!
		#urlKey = Symbol!

	get router\Router
		node.ownerDocument.router

	get route
		let pr = parent ? parent.route : self.router
		pr.route(#path)

	get match
		#match

	get params
		(#match or #unmatched)

	get state
		let map = #dataMap ||= new Map
		let pars = params
		let data = #dataMap.get(pars)
		data || #dataMap.set(pars,data = {})
		return data

	set state value
		(#dataMap ||= new Map).set(params,value)

	set path value
		if #path =? value
			# TODO only update router if we know that we have subroutes
			self.router.touch!

	get path
		#path

	get isActive
		!!#active

	get active?
		!!#active

	def resolve
		# early return if routing clearly has not changed since
		# previous resolve
		let v = self.router.#version

		return unless #version =? v

		let r = route
		let o = #options
		let url = self.router.path
		let match = r.match(url)
		let shown = #active
		let last = #match
		let changed = match != last
		let prevUrl = match and match[#urlKey]

		if match
			#active = true
			#match = match
			match[#urlKey] = url

		if match
			if changed or (prevUrl != url) or !shown
				#resolved(match,last,prevUrl)

		if !shown and match
			#enter!

		if !match and (shown or shown === null)
			#active = false
			#leave!

		return #match

	def #enter
		node.flags.remove('not-routed')
		node.flags.add('routed')
		node..routeDidEnter(self)

	def #resolved match,prev,prevUrl = ''
		node..routeDidResolve(self,match,prev,prevUrl)

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
		return unless #version =? v

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

	get url
		resolve!
		global.location.origin + #href

	def go
		resolve!

		if #options and #options.replace
			self.router.replace(#href)
		else
			if self.router.path == #href
				yes
			else
				self.router.go(#href)

extend class Node
	get router\Router
		ownerDocument.router

extend class Element

	###
	@idl
	@summary The path/route this element should be enabled for
	###
	set route value\(string | null)
		if value == undefined
			# remove routing
			return
			
		if #route
			#route.path = value
			# if route changes - all child routes need to reinitialize?
			return

		let par = value[0] != '/' ? #context.route : null
		#route = new ElementRoute(self,value,par,route__)

		# TODO Use hook / event api instead
		self.#afterVisit = self.#afterVisitRouted

	get route\ElementRoute
		#route
	
	###
	@idl
	@summary The path/route to go to when clicking this element
	###
	set route-to value
		if value == undefined
			# remove routing
			return

		if #routeTo
			#routeTo.path = value
			return

		let par = value[0] != '/' ? #context.route : null
		#route = #routeTo = new ElementRouteTo(self,value,par,routeTo__)
		self.#afterVisit = self.#afterVisitRouteTo

		# really? shouldnt this be handled by the main router click listener instead?
		self.onclick = do(e)
			if !e.altKey and !e.metaKey and !e.#routeHandler
				e.preventDefault!
				e.#routeHandler = #routeTo
				#routeTo.go!

	def #afterVisitRouted
		if #route
			let up = #parentNode
			let ctx = up and up.#visitContext
			if ctx and ctx.matchedRoute and ctx.matchedRoute != #route
				if #route.#active =? no
					#route.#leave!
					#route.#version = -1
				return

			#route.resolve!

			if #route.active?
				ctx.matchedRoute = #route
			else
				return

		visit! if visit
		##visitContext = null if ##visitContext

	def #afterVisitRouteTo
		if #routeTo
			#routeTo.resolve!

		visit! if visit

	def routeDidEnter route
		#attachToParent!

	def routeDidLeave route
		#detachFromParent!

	def routeDidResolve route, match, prev
		if self.routed isa Function and (match != prev)
			self.router.queue.add do
				suspend!
				let res = await self.routed(match,route.state,prev)
				unsuspend!
		return

extend class Document
	get router\Router
		#router ||= new Router(self)