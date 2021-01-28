
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

	def reparse
		parse(url)
		
	# should definitely add match here
	
	def search
		let str = searchParams ? searchParams.toString() : ''
		str ? ('?' + str) : ''
		
	def update value
		if value isa Object
			for own k,v of value
				self.query(k,v)

		elif typeof value == 'string'
			self.parse(value)
		return self
		
	def query name, value
		let q = self.searchParams
		return q.get(name) if value === undefined
		(value == null or value == '') ? q.delete(name) : q.set(name,value)
	
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
		
	def toString
		href
		
	def match str
		let route = ROUTES[str] ||= new Route(null,str)
		route.test(self)
