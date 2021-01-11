const schema = {
	loader: 'merge'
	node: 'merge'
	browser: 'merge'
	defaults: 'merge'
}

export const defaultConfig = {
	buildfile: 'imbabuild.json'

	outdir: 'dist'

	node: {
		platform: 'node'
		format: 'cjs'
		outdir: 'dist'
		sourcemap: true
		target: ['node12.19.0']
		external: ['dependencies','!imba']
	}

	browser: {
		platform: 'browser'
		format: 'esm'
		outdir: 'dist'
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
		web: {
			target: [
				'es2020',
				'chrome58',
				'firefox57',
				'safari11',
				'edge16'
			]
		} 

		worker: {
			splitting: false
			hashing: true
			format: 'iife'
			platform: 'worker'
		}
		serviceworker: {
			splitting: false
			hashing: false
			format: 'iife'
			platform: 'worker'
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