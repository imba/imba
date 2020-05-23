# import {Route} from './Route'
# import {URLSearchParams} from '../lib/util'
# check if is web
var isWeb = typeof window !== 'undefined'

var ROUTES = {}
# proxy for hash
class Hash
	
import {Location} from './location'
import {History} from './history'
import {Request} from './request'
import {Route} from './route'

import './element'

var MainInstance

export class Router
	static get instance
		MainInstance ||= self.new

	# support redirects
	def constructor o = {}
		routes = {}
		options = o
		busy = []
		root = o.root or ''
		history = $web$ ? window.history : History.new(self)
		location = Location.new(o.url or ($web$ ? document.location.href : '/'),self)
		mode = o.mode or 'history'

		self.setup!

		if $web$
			instance ||= self
			
		self

	get origin
		#origin ||= document.location.origin
		
	def option key, value
		if value == undefined
			return options[key]
		else
			options[key] = value
		return self
		
	get realpath
		if $web$
			let loc = document.location
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
					
				if isWeb
					location.state = window.history.state
					
				self.emit('change',req)
				imba.commit()
		
		$web$ and self.onReady do
			# deprecate
			let hash = document.location.hash
			if hash != $hash
				self.emit('hashchange',$hash = hash)

		refreshing = no
		self
	
	def onpopstate e
		self.refresh(pop: yes, mode: 'pop')
		self

	def onbeforeunload e
		let req = Request.new(self,null,location)
		self.emit('beforechange',req)
		return true if req.aborted
		return
		
	def onhashchange e
		emit('hashchange',$hash = document.location.hash)
		imba.commit()

	def setup
		if isWeb
			onclick = onclick.bind(self)
			onhashchange = onhashchange.bind(self)
			
			$hash = document.location.hash
			location = Location.parse(realpath,self)
			history.replaceState(self.state,null,String(location))

			window.onpopstate = self.onpopstate.bind(self) # do |e| onpopstate(e)
			window.onbeforeunload = self.onbeforeunload.bind(self)

			window.addEventListener('hashchange',onhashchange)
			window.addEventListener('click',onclick,capture: yes)
		self
		
	def onclick e
		
		if let a = e.path.find(do $1.nodeName == 'A' )
			let href = a.getAttribute('href')
			if href && !href.match(/\:\/\//) and !(e.metaKey and !e.altKey) and !a.getAttribute('target')
				a.addEventListener('click',onclicklink.bind(self),once: true)
		yes
		
	def onclicklink e
		let a = e.path.find(do $1.nodeName == 'A' )
		let href = a.getAttribute('href')
		let url = URL.new(a.href)
		let target = url.href.slice(url.origin.length)

		self.go(target)
		e.stopPropagation()
		e.preventDefault()
	
	get path
		return location.path

	get url
		return location.url
	
	def query par,val
		if par == undefined
			return location.searchParams()
		else
			return location.query(par,val)
		
	get hash
		$hash

	def serializeParams params
		if params isa Object
			var value = for own key,val of params
					[key,global.encodeURI(val)].join("=")
			return value.join("&")
		return params or ''

	set hash value
		if isWeb
			# console.log "set hash",serializeParams(value)
			# will set without jumping
			history.replaceState({},null,'#' + self.serializeParams(value)) # last state?
			# location:hash = serializeParams(value)
		
	def match pattern
		var route = routes[pattern] ||= Route.new(self,pattern)
		route.test()
		
	def route pattern
		routes[pattern] ||= Route.new(self,pattern)

	def routeFor node, path, par, opts
		Route.new(self,path,par,opts)
		
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
		imba.scheduler.add do
			busy.length == 0 ? cb(self) : imba.once(self,'ready',cb)
			
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

		let ev = self.trigger('taproute',path: href, sourceEvent: e, router: self.router) # include metaKey etc
		unless ev.isPrevented()
			e.stop().prevent()
			(e.meta() or e.alt()) ? window.open(href,'_blank') : self.router.go(href,{})
		return

if $web$
	extend tag element
		get router
			MainInstance ||= Router.new()