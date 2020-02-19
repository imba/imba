extern encodeURI

import {Route} from './Route'
import {URLSearchParams} from '../lib/util'
# check if is web

var isWeb = typeof window !== 'undefined'

var ROUTES = {}
# proxy for hash
class Hash
	
export class Location
	
	def self.parse url
		if url isa Location
			return url
		return self.new(url)

	prop path
	prop state

	def initialize url
		parse(url)
	
	def parse url
		var path = @url = url
		if url.indexOf('?') >= 0
			let parts = url.split('?')
			path = parts.shift
			@searchParams = URLSearchParams.new(parts.join('?'))
		elif @searchParams and @path and @path != path
			# if we change location - search-params are wiped out
			@searchParams = null

		@path = path
		self
		
	def path
		@path
		
	def searchParams
		@searchParams ||= URLSearchParams.new('')
		
	# should definitely add match here
	
	def search
		let str = @searchParams ? @searchParams.toString : ''
		str ? ('?' + str) : ''
		
	def update value
		if value isa Object
			query(k,v) for own k,v of value
		elif value isa String
			parse(value)
		return self
		
	def query name, value
		let q = searchParams
		return q.get(name) if value === undefined
		(value == null or value == '') ? q.delete(name) : q.set(name,value)
	
	def clone
		Location.new(toString)
		
	def equals other
		toString == String(other)
	
	def url
		@path + search
		
	def toString
		@path + search
		
	def location
		self
		
	def match str
		let route = ROUTES[str] ||= Route.new(null,str)
		route.test(self)

class Request
	prop router
	prop referrer
	prop aborted
	prop location
	prop state
	prop mode

	def initialize router, location, referrer
		@router = router
		if location
			@location = Location.parse(location)
			@original = @location.clone

		@referrer = referrer
		# @path = @originalPath = path
		# @referrer = referrer

	def redirect path
		@location?.update(path)
		# allow normalizing urls
		# @redirected = @path = path
		self
		
	def path
		@location?.path
		
	def url
		@location?.toString
		
	def path= value
		@location.path = value

	def abort forced = no
		@aborted = yes
		@forceAbort = forced if forced
		self

	def match str
		@location ? Route.new(self,str).test : null

class History
	def initialize router
		@router = router
		@stack = []
		@pos = -1
		
	def pushState state, title, url
		@stack:length = Math.max(@pos,0)
		@stack[++@pos] = [state,title,url]
		# console.log "pushed state {url}"
		return self
		
	def replaceState state, title, url
		# console.log "replaced state {url}"
		@stack:length = @pos
		@stack[@pos] = [state,title,url]
		
	def popState
		@stack:length = @pos + 1
		@pos -= 1
		return @stack.pop
		
	def currentState
		@stack[@pos]
		

export class Router
	@instance = null
	
	prop mode watch: yes, chainable: yes
	prop busy
	prop root

	def self.instance
		@instance ||= self.new

	# support redirects
	def initialize o = {}
		@hash = ''
		@routes = {}
		@options = o
		@busy = []
		@root = o:root or ''
		@history = isWeb ? window:history : History.new(self)
		@location = Location.new(o:url or '/')
		mode = o:mode or 'history'
		setup

		if isWeb
			# warn if multiple instances?
			@instance ||= self
			@clickHandler = do |e| onclick(e)
			@captor = window.addEventListener('click',@clickHandler,yes)
		self
		
	def option key, value
		if value == undefined
			return @options[key]
		else
			@options[key] = value
		return self
		
	def location
		@location
		
	def realLocation
		if isWeb
			let loc = document:location
			return loc:href.slice(loc:origin:length)
		return String(@location)

	def state
		{}
		
	def pushState state, title, url
		history.pushState(state,title or null,String(url))
	
	def replaceState state, title, url
		history.replaceState(state,title or null,String(url))

	def refresh params = {}
		return if @refreshing
		@refreshing = yes
		
		let original = @location
		let loc = Location.parse(params:location or realLocation)
		let mode = params:mode
	
		# we need to compare with the previously stored location
		# also see if state is different?
		if !loc.equals(original)
			# console.log "actual url has changed!!",String(original),'to',String(loc)
			let req = Request.new(self,loc,original)
			req.mode = mode
			
			emit('beforechange',req)

			if req.aborted
				# console.log "request was aborted",params
				# what about silent abort?
				var res = !req.@forceAbort && window.confirm("Are you sure you want to leave? You might have unsaved changes")

				if res
					req.aborted = no
				# if we don't confirm, push the previous state again
				elif mode == 'pop' # params:pop
					pushState(state,null,String(original))
				elif mode == 'replace' # mode != 'push' # !params:push
					replaceState(state,null,String(original))

				# if we're not popping - should happen before we are changing

			unless req.aborted
				@location = req.location

				if mode == 'push'
					pushState(params:state or state,null,String(@location))
				elif mode == 'replace' # params:replace
					replaceState(params:state or state,null,String(@location))
					
				if isWeb
					@location.state = window:history:state
					
				emit('change',req)
				Imba.commit
		
		isWeb and onReady do
			# deprecate
			let hash = document:location:hash
			if hash != @hash
				emit('hashchange',@hash = hash)

		@refreshing = no
		self
	
	def onpopstate e
		refresh(pop: yes, mode: 'pop')
		self

	def onbeforeunload e
		let req = Request.new(self,null,@location)
		emit('beforechange',req)
		return true if req.aborted
		return

	def setup
		if isWeb
			# let url = location:pathname
			# temporary hack to support scrimba out-of-the-box
			if !@root and window.SCRIMBA_ROOT and mode != 'hash'
				@root = window.SCRIMBA_ROOT.replace(/\/$/,'')

			let url = self.url
			# if url and @redirects[url]
			@location = Location.parse(realLocation)
			history.replaceState(state,null,String(@location))
			window:onpopstate = self:onpopstate.bind(self) # do |e| onpopstate(e)
			window:onbeforeunload = self:onbeforeunload.bind(self)

			@hash = document:location:hash
			window.addEventListener('hashchange') do |e|
				emit('hashchange',@hash = document:location:hash)
				Imba.commit
		self
	
	def path
		return @location.path
		# let url = @url || (isWeb ? (mode == 'hash' ? (hash or '').slice(1) : location:pathname) : '')
		# if @root and url.indexOf(@root) == 0
		# 	url = url.slice(@root:length)
		# url = '/' if url == ''
		# return url
		
	def url
		return @location.url
	
	def query par,val
		if par == undefined
			return @location.searchParams
		else
			return @location.query(par,val)
		
	def hash
		# @hash?
		(isWeb ? document:location:hash : '')

	def serializeParams params
		if params isa Object
			var value = for own key,val of params
					[key,encodeURI(val)].join("=")
			return value.join("&")
		return params or ''

	def setHash value
		if isWeb
			# console.log "set hash",serializeParams(value)
			# will set without jumping
			history.replaceState({},null,'#' + serializeParams(value)) # last state?
			# location:hash = serializeParams(value)
		return self
		
	def history
		@history
		
	def match pattern
		var route = @routes[pattern] ||= Route.new(self,pattern)
		route.test
		
	def route pattern
		@routes[pattern] ||= Route.new(self,pattern)
		
	def go url, state = {}
		let loc = @location.clone.update(url,state)
		refresh(push: yes, mode: 'push', location: loc, state: state)
		self
		
	def replace url, state = {}
		let loc = @location.clone.update(url,state)
		refresh(replace: yes, mode: 'replace', location: loc, state: state)
		# history.replaceState(state,null,normalize(url,state))
		# refresh
		
	def normalize url
		if mode == 'hash'
			url = "#{url}"
		elif root
			url = root + url
		return url
		
	def onReady cb
		Imba.ticker.add do
			@busy.len == 0 ? cb(self) : Imba.once(self,'ready',cb)
			
	def emit name, *params do Imba.emit(self,name,params)
	def on name, *params do Imba.listen(self,name,*params)
	def once name, *params do Imba.once(self,name,*params)
	def un name, *params do Imba.unlisten(self,name,*params)
	
	# bound to target
	def tapRouteHandler e
		let el = dom
		let href = dom.getAttribute('href')

		if el:nodeName != 'A' and (e.meta or e.alt)
			e.stop.prevent
			window.open(href,'_blank')

		let ev = trigger('taproute',path: href, sourceEvent: e, router: router) # include metaKey etc
		unless ev.isPrevented
			e.stop.prevent
			(e.meta or e.alt) ? window.open(href,'_blank') : router.go(href,{})
		return

	def onclick e
		# console.log "onclick",e, e:defaultPrevented
		let i = 0
		# let path = e:path
		let el = e:target
		let href
		
		return if e:defaultPrevented

		while el and el:getAttribute # = e:path[i++]
			break if href = el.getAttribute('href')
			el = el:parentNode

		if !el or !href or (href[0] != '#' and href[0] != '/' and href[0] != '?')
			return

		# deal with alternative routes
		if el.@tag
			if el.@tag:resolveRoute
				el.@tag.resolveRoute
				href = el.getAttribute('href')

			el.@tag['on$'](-20,['tap',self:tapRouteHandler])
			return
		self

const LinkExtend =
	def inject node, opts
		let render = node:render
		node:resolveRoute = self:resolveRoute
		node:beforeRender = self:beforeRender
		# node:ontap ||= self:ontap
		
	def beforeRender
		resolveRoute
		return yes
	
	def ontap e
		resolveRoute
		var href = self:href ? self.href : dom:href
		return unless href

		if (href[0] != '#' and href[0] != '/' and href[0] != '?')
			e.@responder = null
			e.prevent.stop
			return window.open(href,'_blank')
			
		if e.meta or e.alt
			e.@responder = null
			e.prevent.stop
			return window.open(router.root + href,'_blank')

		var ev = trigger('taproute',path: href)

		unless ev.isPrevented
			e.prevent.stop
			router.go(href,{})
		
	def resolveRoute
		return self unless @route

		let match = @route.test
		let href =  @route.resolve

		if @route and @route.option(:sticky)
			let prev = @route.params:url
			if prev and prev.indexOf(href) == 0
				href = prev

		setAttribute('href',router.root + href)
		flagIf('active',match)
		return self

const RoutedExtend =

	def inject node
		node.@params = {}
		node:resolveRoute = self:resolveRoute
		node:beforeRender = self:beforeRender
		node:renderWithStatusCode = self:renderWithStatusCode
		node.detachFromParent

	def renderWithStatusCode code = @route.status
		if self["render{code}"]
			self["render{code}"]()
			return yes
		return no

	def beforeRender
		resolveRoute
		return no if !@params.@active

		let status = @route.status

		if renderWithStatusCode(status)
			return no

		if status >= 200
			return yes

		return no

	def resolveRoute next
		let prev = @params
		let prevUrl = prev and prev:url
		let match = @route.test

		if match
			let active = match.@active
			match.@active = true

			if match != prev
				params = match

			if match != prev or !active or (match:url != prevUrl)
				routeDidResolve(match,prev)

			if !active
				# match.@active = true
				# should happen after load?
				routeDidEnter

		elif prev and prev.@active
			prev.@active = false
			routeDidLeave


extend tag element
	prop params watch: yes

	def route
		@route
		
	def setRoute path, mods
		let prev = @route

		unless prev
			path = String(path)
			let par = path[0] != '/' ? getParentRoute : null
			let opts = mods || {}
			opts:node = self
			@route = Route.new(router,path,par,opts)
			if opts:link
				LinkExtend.inject(self,opts)
			else
				RoutedExtend.inject(self)
		elif String(path) != prev.@raw
			prev.setPath(String(path))
		self
		
	def setRouteTo path, mods
		if @route
			setRoute(path)
		else
			mods ||= {}
			mods:link = true
			setRoute(path,mods)

	# for server
	def setRouterUrl url
		@router ||= Router.new(url)
		return self
		
	def setRouterRoot url
		router.root = url
		return self
	
	def getParentRoute
		var route = null
		var par = @owner_
		while par
			if par.@route
				return par.@route
			par = par.@owner_
		return null
		
	def setRouter router
		@router = router
		return self

	def router
		@router ||= (@owner_ and @owner_.router or Router.instance)
		# isWeb ? Router.instance : (@router or (@owner_ ? @owner_.router : (@router ||= Router.new)))

	def routeDidLoad params
		# log 'routeDidLoad'
		self

	def routeDidFail error
		self

	def routeDidMatch
		self

	def routeDidEnter
		attachToParent
		Imba.commit
		self

	def routeDidLeave
		detachFromParent
		Imba.commit
		self

	def routeDidResolve params, prev
		if !self:load or (params == prev and !self:reload)
			routeDidMatch(params)
			routeDidLoad(params,prev)
			return self

		route.load do
			routeDidMatch(params)
			let val
			try
				if params != prev
					val = await self.load(params,prev)
				elif self:reload
					val = await self.reload(params,prev)
			catch e
				# log "route error",e
				val = 400
				routeDidFail(e)
			routeDidLoad(val)
			return val

		return self


	def ontaproute
		self
