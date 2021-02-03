const cacheMap = new Map
const urlCache = {}
const queryCache = {}

def cacheForMatch match
	unless cacheMap.has(match)
		let map = new Map
		cacheMap.set(match,map)
		return map
	return cacheMap.get(match)

def combinedDeepMatch parent, params
	let map = cacheForMatch(parent)
	unless map.has(params)
		let item = Object.create(parent)
		Object.assign(item,params)
		map.set(params,item)
		return item

	return map.get(params)

export class RouteMatch

export class Match
	params = {}
	url = null
	path = null



def parseUrl str
	if urlCache[str]
		return urlCache[str]

	let url = urlCache[str] = {url: str}

	let qryidx = str.indexOf('?')
	let hshidx = str.indexOf('#')

	if hshidx >= 0
		url.hash = str.slice(hshidx + 1)
		str = url.url = str.slice(0,hshidx)
	
	if qryidx >= 0
		let q = url.query = str.slice(qryidx + 1)
		str = str.slice(0,qryidx)
		url.query = queryCache[q] ||= new URLSearchParams(q)
	
	url.path = str
	return url

export class RootRoute
	constructor router
		router = router
		fullPath = ''
		#routes = {}
		#match = new RouteMatch
		#match.path = ''
	
	def route pattern
		#routes[pattern] ||= new Route(router,pattern,self)

	def match
		return #match
	
	def resolve url
		return '/'

export class Route
	def constructor router, str, parent
		self.parent = (parent or router.rootRoute)
		router = router
		status = 200
		path = str
		#symbol = Symbol!
		#matches = {}
		#routes = {}
	
	def route pattern
		#routes[pattern] ||= new Route(router,pattern,self)

	get fullPath
		"{parent.fullPath}/{$path}"

	def #matchForParams params, prefix = ''
		let key = prefix + JSON.stringify(params)
		let match = #matches[key]
		unless match
			match = #matches[key] = new Match(params: params)
			params.#match = match
		return match
	
	def load cb
		# pushing data o the queue
		router.queue.add cb
		
	set path path
		return if $path == path

		raw = path
		$path = path
		groups = []
		cache = {}
		dynamic = no
		
		if path.indexOf('?') >= 0
			let parts = path.split('?')
			path = parts.shift()
			query = {}
			# loop through and create regexes for matching?
			for pair in parts.join('?').split('&')
				continue unless pair
				let [k,v] = pair.split('=')
				if k[0] == '!'
					dynamic = yes
					k = k.slice(1)
					v = false
				if v === ''
					v = false
				if v and v[0] == ':'
					dynamic = yes

				query[k] = v or (v === false ? false : true)

		path = path.replace(/\:(\w+|\*)(\.)?/g) do |m,id,dot|
			# what about :id.:format?
			dynamic = yes
			groups.push(id) unless id == '*'
			if dot
				return "([^\/\#\.\?]+)\."
			else
				return "([^\/\#\?]+)"
		
		if path == '' and query
			return
			
		path = '^' + path
		let end = path[path.length - 1]
		if end == '$'
			path = path.slice(0,-1) + '(?=\/?[\#\?]|\/?$)'

		if (end != '/' and end != '$' and path != '^/')
			path = path + '(?=[\/\#\?]|$)'

		regex = new RegExp(path)

		self

	def match str = router.path
		let up = parent.match(str)
		return null unless up
		let url = parseUrl(str)		
		let matcher = url.url
		let prefix = ''

		if up.path and url.path.indexOf(up.path) == 0
			prefix = up.path + '/'
			matcher = matcher.slice(prefix.length)

		# try to match our part of the path with regex
		if let match = (regex ? matcher.match(regex) : [''])
			let fullpath = prefix + match[0]
			let matchid = [$path]
			let params = {}
			
			if groups.length
				for item,i in match
					if let name = groups[i - 1]
						params[name] = item
						matchid.push(item)
			
			if query
				for own k,v of query
					let name = k
					let m = url.query.get(k)

					if v === false
						return null	if m
						matchid.push('1')
						continue
					
					if v[0] == ':'
						name = v.slice(1)
						v = true

					if (v == true and m) or v == m
						params[name] = m
						matchid.push(m)
					else
						return null

			let key = matchid.join("*")
			params = (#matches[key] ||= params)
			let result = combinedDeepMatch(up,params)
			result.path = fullpath # why / when is this really needed tbh?
			return result

		return null

	def test loc, path
		if typeof loc == 'string'
			loc = {pathname: loc, path: loc}
			# let loc = new URL(loc,document.location.origin)
			# let path = loc.href.slice(loc.origin.length)
		# test with location
		loc ||= router.location
		path ||= loc.pathname
		let url = loc.path
		let urlkey = (query ? url : path)

		# should only cache
		let cached = #matches[urlkey]
		if cached !== undefined
			return cached

		#matches[urlkey] = null

		let prefix = ''
		let matcher = path
		let qmatch
		
		let parentMatch = null
		
		if query
			qmatch = {}
			for own k,v of query
				let m = loc.query[k]
				let name = k
				# no match
				if v === false
					return null	if m
					continue
				
				if v[0] == ':'
					name = v.slice(1)
					v = true

				if (v == true and m) or v == m
					qmatch[name] = m

				else
					return null

		if parent and raw[0] != '/'
			if let m = parent.test(loc,path)
				parentMatch = m
				if path.indexOf(m.path) == 0
					prefix = m.path + '/'
					matcher = path.slice(m.path.length + 1)
					# maybe cache the subroute on the parent match / result??
			else
				return null

		# try to match our part of the path with regex
		if let match = (regex ? matcher.match(regex) : [''])
			let fullpath = prefix + match[0]
			let matchid = [$path]
			let params = {}
			
			if groups.length
				for item,i in match
					if let name = groups[i - 1]
						params[name] = item
						matchid.push(item)

			if qmatch
				for own k,v of qmatch
					params[k] = v
					matchid.push(v)

			let key = matchid.join("*")
			console.log 'match key',key

			# if parentMatch
			let cachedParams = #matches[key] ||= params

			if parentMatch
				cachedParams = combinedDeepMatch(parentMatch,cachedParams)
				console.log 'combined!!'
				# result = #matches[urlkey] = combined

			let result = #matches[urlkey] = cachedParams
			# #matchForParams(params)
			result.url = url
			result.path = fullpath
			# try to match tab-values as well

			return result

		return null

	def resolve url = router.path
		return raw.replace(/\$/g,'') if raw[0] == '/' and !dynamic

		let up = parent.match(url)
		let upres = parent.resolve(url)
		let out

		if dynamic
			let m = match(url)
			if m
				return m.path
			else
				return null

		if raw[0] == '?'
			out = (upres or '/') + raw
		else
			out = upres + '/' + raw

		return out.replace(/\$/g,'').replace(/\/\/+/g,'/')

		url ||= router.url
	
		if cache.resolveUrl == url and cache.resolved
			return cache.resolved

		cache.resolveUrl = url
		
		if parent
			if let m = parent.test!
				if raw[0] == '?'
					cache.resolved = m.path + raw
				else
					cache.resolved = m.path + '/' + raw
		else
			# FIXME what if the url has some unknowns?
			cache.resolved = raw # .replace(/[\@\$]/g,'')

		return cache.resolved
		