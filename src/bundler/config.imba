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
		format: 'esm'
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
	return config