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
			resolve: {
				imba: {path: 'imba', external: yes}
			}
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
			banner: "//HELLO FROM IIFE"
		}

		standalone: {
			platform: 'browser'
			sourcemap: true
			format: 'esm'
			splitting: true
			resolve: {
				imba: {path: '/__imba__.js', external: yes}
			}
		}

		img: {
			resolveExtensions: ['.svg','.png','.jpg']
			loader: 'image'
		}

		webcjs: {
			splitting: false
			format: 'cjs'
			platform: 'browser'
			banner: "//HELLO FROM CJS"
		}

		worker: {
			splitting: false
			hashing: true
			format: 'esm'
			platform: 'worker'
			banner: "//WORKER HERE"
		}

		nodeworker: {
			splitting: false
			format: 'esm'
			platform: 'node'
			banner: "//NODEWORKER"
		}

		webworker: {
			splitting: false
			format: 'iife'
			platform: 'browser'
			banner: "//WEBWORKER"
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