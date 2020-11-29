const cached = {}

def resolvePaths obj,cwd
	if obj isa Array
		for item,i in obj
			obj[i] = resolvePaths(item,cwd)
	elif typeof obj == 'string'
		return obj.replace(/^\.\//,cwd + '/')
	elif typeof obj == 'object'
		for own k,v of obj
			let alt = k.replace(/^\.\//,cwd + '/')
			obj[alt] = resolvePaths(v,cwd)
			if alt != k
				delete obj[k]
	return obj

export def resolveConfigFile dir,{path,fs}
	return null if !path or !fs or !dir or (dir == path.dirname(dir))
	let src = path.resolve(dir,'package.json')
	if cached[src]
		return cached[src]

	if cached[src] !== null and fs.existsSync(src)
		let resolver = do(key,value)

			if typeof value == 'string' and value.match(/^\.\//)
				return path.resolve(dir,value)
			return value

		let package = JSON.parse(fs.readFileSync(src,'utf8'))
		let config = package.imba ||= {}
		resolvePaths(config,dir)
		config.package = package
		config.cwd ||= dir

		# DEPRECATED – to be removed
		let assetsDir = path.resolve(dir,'assets')
		let assets = config.assets ||= {}
		# look for assets directory
		if fs.existsSync(assetsDir)
			const entries = fs.readdirSync(assetsDir)
			for entry in entries when entry.match(/\.svg/)
				let src = path.resolve(assetsDir,entry)
				let name = path.basename(src,'.svg')
				let body = fs.readFileSync(src,'utf8')
				assets[name] = {body: body}
		return cached[src] = config
	else
		cached[src] = null

	return resolveConfigFile(path.dirname(dir),{path:path,fs:fs})