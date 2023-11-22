# imba$stdlib=1
export const ROUTES = {}

export class Location

	static def parse url, router
		if url isa Location
			return url
		return new Location(url,router)

	def constructor url, router
		router = router
		self.parse(url)

	def parse url
		url = new URL(url,router.origin) unless url isa URL
		if let alias = router..aliases[url.pathname]
			url.pathname = alias
		self.url = url
		self

	get active?
		router.location == self

	def reparse
		parse(url)

	# should definitely add match here
	get searchParams
		url.searchParams

	def search
		let str = searchParams ? searchParams.toString() : ''
		str ? ('?' + str) : ''

	def update value
		if value isa Object
			for own k,v of value
				self.searchParams.set(k,v)

		elif typeof value == 'string'
			self.parse(value)
		return self

	def clone
		new Location(url.href,router)

	def equals other
		self.toString() == String(other)

	get href
		url.href

	get path
		url.href.slice(url.origin.length)

	get pathname
		url.pathname

	get query
		#query ||= new Proxy({},{
			get: #getQueryParam.bind(self)
			set: #setQueryParam.bind(self)
		})

	def toString
		href

	def #getQueryParam target, name
		searchParams.get(name)

	def #setQueryParam target, name, value
		let curr = #getQueryParam(target,name)
		if curr != value
			if (value == null or value == '')
				searchParams.delete(name)
			else
				searchParams.set(name,value)

			if active?
				# need to improve how we update the state?
				router.history.replaceState({},null,url.toString!)
				router.touch!
		return yes
