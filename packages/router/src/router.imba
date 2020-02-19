# import {Route} from './Route'
# import {URLSearchParams} from '../lib/util'
# check if is web
var isWeb = typeof window !== 'undefined'

var ROUTES = {}
# proxy for hash
class Hash
	
import Location from './location'
import History from './history'
import Request from './request'
import Route from './route'

import './element'

var MainInstance

export default class Router
	static get instance
		MainInstance ||= self.new

	# support redirects
	def constructor o = {}
		@routes = {}
		@options = o
		@busy = []
		@root = o.root or ''
		@history = $web$ ? window.history : History.new(self)
		@location = Location.new(o.url or ($web$ ? document.location.href : '/'),self)
		@mode = o.mode or 'history'

		self.setup()

		if $web$
			@instance ||= self
			# @clickHandler = do |e| self.onclick(e)
			# @captor = window.addEventListener('click',@clickHandler,yes)
		self

	get origin
		#origin ||= document.location.origin
		
	def option key, value
		if value == undefined
			return @options[key]
		else
			@options[key] = value
		return self
		
	get realpath
		if $web$
			let loc = document.location
			return loc.href.slice(loc.origin.length)
		return @location.path

	def state
		{}
		
	def pushState state, title, url
		@history.pushState(state,title or null,String(url))
	
	def replaceState state, title, url
		@history.replaceState(state,title or null,String(url))

	# called whenever the location might have changed for some reason
	def refresh params = {}
		return if @refreshing
		@refreshing = yes

		let original = @location
		let loc = Location.parse(params.location or @realpath,self)
		let mode = params.mode
		console.log 'refreshing router',params,loc,mode,original
		# we need to compare with the previously stored location
		# also see if state is different?
		if !loc.equals(original)
			console.log "actual url has changed!!",String(original),'to',String(loc)
			let req = Request.new(self,loc,original)
			req.mode = mode
			
			self.emit('beforechange',req)

			if req.aborted
				# console.log "request was aborted",params
				# what about silent abort?
				var res = !req.forceAbort && window.confirm("Are you sure you want to leave? You might have unsaved changes")

				if res
					req.aborted = no
				# if we don't confirm, push the previous state again
				elif mode == 'pop' # params:pop
					self.pushState(self.state(),null,String(original))
				elif mode == 'replace' # mode != 'push' # !params:push
					self.replaceState(self.state(),null,String(original))

				# if we're not popping - should happen before we are changing

			unless req.aborted
				@location = req.location

				if mode == 'push'
					self.pushState(params.state or self.state(),null,String(@location))
				elif mode == 'replace' # params:replace
					self.replaceState(params.state or self.state(),null,String(@location))
					
				if isWeb
					@location.state = window.history.state
					
				self.emit('change',req)
				# now 
				imba.commit()
		
		$web$ and self.onReady do
			# deprecate
			let hash = document.location.hash
			if hash != #hash
				self.emit('hashchange',#hash = hash)

		@refreshing = no
		self
	
	def onpopstate e
		self.refresh(pop: yes, mode: 'pop')
		self

	def onbeforeunload e
		let req = Request.new(self,null,@location)
		self.emit('beforechange',req)
		return true if req.aborted
		return

	def setup
		if isWeb
			console.log 'setup on client'
			# let url = self.url()
			# if url and @redirects[url]
			@location = Location.parse(@realpath,self)
			@history.replaceState(self.state(),null,String(@location))

			window.onpopstate = self.onpopstate.bind(self) # do |e| onpopstate(e)
			window.onbeforeunload = self.onbeforeunload.bind(self)

			#hash = document.location.hash
			window.addEventListener('hashchange') do |e|
				self.emit('hashchange',#hash = document.location.hash)
				imba.commit()
		self
	
	get path
		return @location.path
		# let url = @url || (isWeb ? (mode == 'hash' ? (hash or '').slice(1) : location:pathname) : '')
		# if @root and url.indexOf(@root) == 0
		# 	url = url.slice(@root:length)
		# url = '/' if url == ''
		# return url
		
	get url
		return @location.url
	
	def query par,val
		if par == undefined
			return @location.searchParams()
		else
			return @location.query(par,val)
		
	get hash
		#hash

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
			@history.replaceState({},null,'#' + self.serializeParams(value)) # last state?
			# location:hash = serializeParams(value)
		return self
		
	def match pattern
		var route = @routes[pattern] ||= Route.new(self,pattern)
		route.test()
		
	def route pattern
		@routes[pattern] ||= Route.new(self,pattern)

	def routeFor node, path, par, opts
		Route.new(self,path,par,opts)
		
	def go url, state = {}
		let loc = @location.clone().update(url,state)
		self.refresh(push: yes, mode: 'push', location: loc, state: state)
		self
		
	def replace url, state = {}
		let loc = @location.clone().update(url,state)
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
		imba.scheduler.add do
			# 
			@busy.length == 0 ? cb(self) : imba.once(self,'ready',cb)
			
	def emit name, ...params do imba.emit(self,name,params)
	def on name, ...params do imba.listen(self,name,...params)
	def once name, ...params do imba.once(self,name,...params)
	def un name, ...params do imba.unlisten(self,name,...params)
	
	# bound to target
	def tapRouteHandler e
		let el = self.dom()
		let href = self.dom().getAttribute('href')

		if el.nodeName != 'A' and (e.meta() or e.alt())
			e.stop().prevent()
			window.open(href,'_blank')

		let ev = self.trigger('taproute',path: href, sourceEvent: e, router: self.router()) # include metaKey etc
		unless ev.isPrevented()
			e.stop().prevent()
			(e.meta() or e.alt()) ? window.open(href,'_blank') : self.router().go(href,{})
		return

	def onclick e
		return
		# console.log "onclick",e, e:defaultPrevented
		let i = 0
		# let path = e:path
		let el = e.target
		let href
		
		return if e.defaultPrevented

		while el and el.getAttribute # = e:path[i++]
			break if href = el.getAttribute('href')
			el = el.parentNode

		if !el or !href or (href[0] != '#' and href[0] != '/' and href[0] != '?')
			return

		# deal with alternative routes
		if el
			if el.resolveRoute
				el.resolveRoute()
				href = el.getAttribute('href')
			# el['on$'](-20,['tap',self.tapRouteHandler])
			return
		self


if $web$
	extend tag element
		get router
			MainInstance ||= Router.new()

class LinkMixin
	def inject node, opts
		let render = node.render
		node.resolveRoute = self.resolveRoute
		node.beforeRender = self.beforeRender
		# node:ontap ||= self:ontap
		
	def beforeRender
		self.resolveRoute()
		return yes
	
	def ontapz e
		self.resolveRoute()
		var href = self.href ? self.href() : self.dom().href
		return unless href

		if (href[0] != '#' and href[0] != '/' and href[0] != '?')
			e.responder = null
			e.prevent().stop()
			return window.open(href,'_blank')
			
		if e.meta() or e.alt()
			e.responder = null
			e.prevent().stop()
			return window.open(self.router().root() + href,'_blank')

		var ev = self.trigger('taproute',path: href)

		unless ev.isPrevented()
			e.prevent().stop()
			self.router().go(href,{})
		
	def resolveRoute
		return self unless @route

		let match = @route.test()
		let href =  @route.resolve()

		if @route and @route.option('sticky')
			let prev = @route.params().url
			if prev and prev.indexOf(href) == 0
				href = prev

		self.setAttribute('href',self.router().root() + href)
		self.flagIf('active',match)
		return self



class RoutedMixin

	def inject node
		node.route$ = {}
		node.resolveRoute = self.resolveRoute
		node.beforeRender = self.beforeRender
		node.renderWithStatusCode = self.renderWithStatusCode
		node.detachFromParent()

	def renderWithStatusCode code = @route.status()
		if self["render{code}"]
			self["render{code}"]()
			return yes
		return no

	def beforeRender
		self.resolveRoute()
		return no if !@params.active

		let status = @route.status()

		if self.renderWithStatusCode(status)
			return no

		if status >= 200
			return yes

		return no

	def resolveRoute next
		let prev = @params
		let prevUrl = prev and prev.url
		let match = @route.test()

		if match
			let active = match.active
			match.active = true

			if match != prev
				self.params = match

			if match != prev or !active or (match.url != prevUrl)
				self.routeDidResolve(match,prev)

			if !active
				# match.@active = true
				# should happen after load?
				self.routeDidEnter()

		elif prev and prev.active
			prev.active = false
			self.routeDidLeave()


###
extend tag element
	# prop params watch: yes

	def route
		@route
		
	def setRoute path, mods
		let prev = @route

		unless prev
			path = String(path)
			let par = path[0] != '/' ? self.getParentRoute() : null
			let opts = mods || {}
			opts.node = self
			@route = Route.new(self.router(),path,par,opts)
			if opts.link
				LinkExtend.inject(self,opts)
			else
				RoutedExtend.inject(self)
		elif String(path) != prev.raw
			prev.setPath(String(path))
		self
		
	def setRouteTo path, mods
		if @route
			self.setRoute(path)
		else
			mods ||= {}
			mods.link = true
			self.setRoute(path,mods)

	# for server
	def setRouterUrl url
		@router ||= Router.new(url)
		return self
		
	def setRouterRoot url
		self.router().root = url
		return self
	
	def getParentRoute
		var route = null
		var par = @owner_
		# use context api
		while par
			if par.route
				return par.route
			par = par.owner_
		return null
		
	def setRouter router
		@router = router
		return self

	def router
		@router ||= (@owner_ and @owner_.router() or Router.instance())
		# isWeb ? Router.instance : (@router or (@owner_ ? @owner_.router : (@router ||= Router.new)))

	def routeDidLoad params
		# log 'routeDidLoad'
		self

	def routeDidFail error
		self

	def routeDidMatch
		self

	def routeDidEnter
		self.attachToParent()
		Imba.commit()
		self

	def routeDidLeave
		self.detachFromParent()
		Imba.commit()
		self

	def routeDidResolve params, prev
		if !self.load or (params == prev and !self.reload)
			self.routeDidMatch(params)
			self.routeDidLoad(params,prev)
			return self

		self.route().load do
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


	def ontaproute
		self
###