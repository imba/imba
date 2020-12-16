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
		target: [
			'es2020',
			'chrome58',
			'firefox57',
			'safari11',
			'edge16',
			'node12.19.0',
		]
		external: ['dependencies','!imba']
	}

	browser: {
		platform: 'browser'
		format: 'esm'
		target: [
			'es2020',
			'chrome58',
			'firefox57',
			'safari11',
			'edge16'
		]
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