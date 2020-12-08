const utils = require './utils'
const path = require 'path'

const schema = {
	loader: 'merge'
	node: 'merge'
	browser: 'merge'
}

export const defaultConfig = {
	buildfile: 'imbabuild.json'

	node: {
		platform: 'node'
		format: 'cjs'
		external: ['dependencies','.json','imba']
		outExtensionz: {
			'.js': '.node.js'
			'.css': '.node.css'
		}
	}

	browser: {
		platform: 'browser'
		format: 'cjs'
		outExtensionz: {
			'.js': '.bundle.js'
			'.css': '.bundle.css'
		}
	}

	bundles: []
}

def clone object
	JSON.parse(JSON.stringify(object))

export def merge config, defaults
	for own key,value of defaults
		let typ = schema[key]

		if config.hasOwnProperty(key)
			if typ == 'merge'
				config[key] = merge(config[key],value)
		else
			config[key] = clone(value)
		
	return config

export def resolve config, cwd
	config = merge(config,defaultConfig)
	
	# may need to rerun when assets change?
	if config.assets and !config.#assets
		let assets = {}

		for own key,value of config.assets
			let paths = []
			for dir in value
				let expanded = await utils.expandPath(path.resolve(cwd,dir),fileFilter: '*.svg', cwd: cwd)
				
				paths.push(...expanded)
			
			for item in paths
				let name = path.basename(item,'.svg').toLowerCase!.replace(/_|\s+/g,'-')
				let asset = assets["{key}-{name}"] ||= {}

				unless asset.path
					asset.path = path.relative(cwd,item)
		
		config.#assets = assets
		# console.log 'assets',assets
		# for part in config.assets
		# 	let items = resolvePaths()
		# for entry in entries when entry.match(/\.svg/)
		# 		let src = path.resolve(assetsDir,entry)
		# 		let name = path.basename(src,'.svg')
		# 		let body = fs.readFileSync(src,'utf8')
		# 		assets[name] = {body: body}

	return config