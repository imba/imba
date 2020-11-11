const cached = {}

export def resolveConfigFile dir,{path,fs}
	return null if !path or !fs or !dir or (dir == path.dirname(dir))
	let src = path.resolve(dir,'imbaconfig.json')
	if cached[src]
		return cached[src]

	if cached[src] !== null and fs.existsSync(src)
		let resolver = do(key,value)
			if typeof value == 'string' and value.match(/^\.\//)
				return path.resolve(dir,value)
			return value
		let config = JSON.parse(fs.readFileSync(src,'utf8'),resolver)
		config.cwd ||= dir
		# if config.styles
		#	config.theme ||= new StyleTheme(config.styles)
		
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