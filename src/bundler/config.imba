const rootSchema = {
	loader: 'merge'
	node: 'merge'
	browser: 'merge'
	defaults: {
		'*': {

		}	
	}
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
			platform: 'browser'
			target: ['es2020','chrome58','firefox57','safari11','edge16']
			sourcemap: true
			format: 'esm'
		}

		client: {
			extends: 'web'
			splitting: true
		}

		iife: {
			extends: 'web'
			format: 'iife'
			splitting: false
			platform: 'browser'
		}

		css: {
			format: 'css'
			platform: 'browser'
			external: ['dependencies','!imba'] # dont exclude css deps?
			sourcemap: false
			splitting: false
		}

		html: {
			format: 'html'
			platform: 'browser'
			sourcemap: false
			splitting: false
			hashing: false
		}

		worker: {
			format: 'esm'
			platform: 'worker'
			splitting: false
		}

		webworker: {
			format: 'esm'
			platform: 'webworker'
			splitting: false
		}
	}
}

def clone object
	JSON.parse(JSON.stringify(object))

export def merge config, defaults, schema = rootSchema
	for own key,value of defaults
		let typ = schema[key] or schema['*']

		if config.hasOwnProperty(key)
			if typ
				config[key] = merge(config[key],value,typ)
		else
			config[key] = clone(value)
		
	return config

export def resolve config, cwd
	config = merge(config,defaultConfig)
	return config