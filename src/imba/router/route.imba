export class Match
	params = {}
	url = null
	path = null

export class Route
	def constructor router, str, parent, options = {}
		parent = parent
		router = router
		options = options
		status = 200
		path = str
		#matches = {}

	def #matchForParams params
		let key = JSON.stringify(params)
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
		
		if path.indexOf('?') >= 0
			let parts = path.split('?')
			path = parts.shift()
			query = {}
			# loop through and create regexes for matching?
			for pair in parts.join('?').split('&')
				continue unless pair
				let [k,v] = pair.split('=')
				if k[0] == '!'
					k = k.slice(1)
					v = false
				if v === ''
					v = false

				query[k] = v or (v === false ? false : true)

		path = path.replace(/\:(\w+|\*)(\.)?/g) do |m,id,dot|
			# what about :id.:format?
			groups.push(id) unless id == '*'
			if dot
				return "([^\/\#\.\?]+)\."
			else
				return "([^\/\#\?]+)"
		
		if path == '' and query
			return
			
		path = '^' + path
		let end = path[path.length - 1]
		if options.exact and end != '$'
			path = path + '(?=[\#\?]|$)'
		elif (end != '/' and end != '$' and path != '^/')
			# we only want to match end OR /
			# if path[path:length - 1]
			path = path + '(?=[\/\#\?]|$)'
		regex = new RegExp(path)
		self

	def test loc, path, cache = self.cache
		# test with location
		loc ||= router.location
		path ||= loc.pathname
		let url = loc.path
		let urlkey = (query ? url : path)

		# should only cache
		if #matches[urlkey] !== undefined
			return #matches[urlkey]

		#matches[urlkey] = null

		let prefix = ''
		let matcher = path
		let qmatch
		let params = {}
		
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
				if path.indexOf(m.path) == 0
					prefix = m.path + '/'
					matcher = path.slice(m.path.length + 1)

		# try to match our part of the path with regex
		if let match = (regex ? matcher.match(regex) : [''])
			let fullpath = prefix + match[0]
			
			if groups.length
				for item,i in match
					if let name = groups[i - 1]
						params[name] = item

			if qmatch
				for own k,v of qmatch
					params[k] = v

			let result = #matches[urlkey] = #matchForParams(params)
			result.url = url
			result.path = fullpath
			# try to match tab-values as well
			return result

		return null

	def resolve url
		return raw if raw[0] == '/'

		url ||= router.url
	
		if cache.resolveUrl == url and cache.resolved
			return cache.resolved

		cache.resolveUrl = url
		
		# if @query
		# 	raw = raw.slice(0,raw.indexOf('?'))
		# 	# add / remove params from url
		
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
		