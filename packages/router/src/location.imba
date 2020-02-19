
export const ROUTES = {}

export default class Location
	
	static def parse url, router
		if url isa Location
			return url
		return self.new(url,router)

	def constructor url, router
		@router = router
		self.parse(url)
	
	def parse url
		console.log 'parsing',url
		url = URL.new(url,@router.origin) unless url isa URL
		@url = url
		self
		
	# should definitely add match here
	
	def search
		let str = @searchParams ? @searchParams.toString() : ''
		str ? ('?' + str) : ''
		
	def update value
		console.log 'updating location',value
		if value isa Object
			for own k,v of value
				self.query(k,v)

		elif typeof value == 'string'
			self.parse(value)
		return self
		
	def query name, value
		let q = self.searchParams()
		return q.get(name) if value === undefined
		(value == null or value == '') ? q.delete(name) : q.set(name,value)
	
	def clone
		Location.new(@url.href,@router)
		
	def equals other
		self.toString() == String(other)
	
	get href
		@url.href

	get path
		@url.href.slice(@url.origin.length)

	get pathname
		@url.pathname
		
	def toString
		@href
		
	def match str
		let route = ROUTES[str] ||= Route.new(null,str)
		route.test(self)
