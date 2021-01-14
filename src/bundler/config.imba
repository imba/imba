const schema = {
	loader: 'merge'
	node: 'merge'
	browser: 'merge'
	defaults: 'merge'
}

export const defaultConfig = {
	node: {
		platform: 'node'
		format: 'cjs'
		sourcemap: true
		target: ['node12.19.0']
		external: ['dependencies','!imba']
	}

	browser: {
		platform: 'browser'
		format: 'esm'
		splitting: true

		target: [
			'es2020',
			'chrome58',
			'firefox57',
			'safari11',
			'edge16'
		]
	}

	bundles: []

	defaults: {
		node: {
			platform: 'node'
			format: 'cjs'
			sourcemap: true
			target: ['node12.19.0']
			external: ['dependencies','!imba']
		}
		web: {
			target: [
				'es2020',
				'chrome58',
				'firefox57',
				'safari11',
				'edge16'
			]
			platform: 'browser'
			sourcemap: true
			format: 'esm'
			splitting: true
		}

		iife: {
			splitting: false
			format: 'iife'
			platform: 'browser'
		}

		worker: {
			splitting: false
			hashing: true
			format: 'esm'
			platform: 'worker'
		}

		webworker: {
			splitting: false
			hashing: true
			format: 'esm'
			platform: 'webworker'
		}
	}
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