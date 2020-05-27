var isWeb = typeof window !== 'undefined'

export class Route
	# prop raw
	# prop params
	# prop status watch: yes
	
	def constructor router, str, parent, options = {}
		parent = parent
		router = router
		options = options
		node = options.node
		status = 200
		path = str
		
	set path path
		return if $path == path

		raw = path
		$path = path
		groups = []
		params = {}
		cache = {}
		
		if path.indexOf('?') >= 0
			let parts = path.split('?')
			path = parts.shift()
			query = {}
			# loop through and create regexes for matching?
			for pair in parts.join('?').split('&')
				continue unless pair
				var [k,v] = pair.split('=')
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

	def test loc, path
		# test with location
		loc ||= router.location
		path ||= loc.pathname

		let url = loc.path

		return cache.match if url == cache.url

		let prefix = ''
		let matcher = path
		cache.url = url
		cache.match = null
		let qmatch
		
		if query
			qmatch = {}
			for own k,v of query
				let m = loc.query(k)
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
			let prevParams = params
			# nothing changed
			if fullpath == params.path
				params.url = url
			else
				params = {path: fullpath, url: url}
				if groups.length
					for item,i in match
						if let name = groups[i - 1]
							params[name] = item
			if qmatch
				let change = no
				for own k,v of qmatch
					if params[k] != v
						change = yes
						params[k] = v

				if change and prevParams == params
					params = Object.assign({},params)
			# try to match tab-values as well
			return cache.match = params

		return cache.match = null
	
	# should split up the Route types
	def statusDidSet status, prev
		let idx = router.busy().indexOf(self)
		clearTimeout(statusTimeout)

		if status < 200
			router.busy().push(self) if idx == -1
			statusTimeout = setTimeout(&,25000) do status = 408
		elif idx >= 0 and status >= 200
			router.busy().splice(idx,1)
			
			# immediately to be able to kick of nested routes
			# is not commit more natural?
			node..commit()
			# Imba.commit
			if router.busy().length == 0
				imba.emit(router,'ready',[router])

		node..setFlag('route-status',"status-{status}")
	
	def load cb
		status = 102

		var _handler = handler = do |res|
			if _handler != handler
				# console.log "another load has started after this"
				return

			handler = null
			status = typeof res == 'number' ? res : 200

		if cb isa Function
			cb = cb(handler)
			
		if cb and cb.then
			cb.then(handler,handler)
		else
			handler(cb)
		self
		
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
			if let m = parent.test()
				if raw[0] == '?'
					# possibly replace with & or even replace param?
					cache.resolved = m.path + raw
				else
					cache.resolved = m.path + '/' + raw
		else
			# FIXME what if the url has some unknowns?
			cache.resolved = raw # .replace(/[\@\$]/g,'')

		return cache.resolved
		