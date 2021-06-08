const optionTypes = {
	esbuild: 'object'
	external: 'array'
	hashing: 'boolean'
	minify: 'boolean'
}


export const defaultConfig = {
	bundles: []

	options: {
		base: {
			target: ['es2019','chrome80','edge18']
		}
		node: {
			extends: 'base'
			platform: 'node'
			format: 'cjs'
			sourcemap: true
			target: ['node12.19.0']
			external: ['dependencies','!imba']
		}
		web: {
			extends: 'base'
			platform: 'browser'
			sourcemap: true
			format: 'esm'
		}

		iife: {
			extends: 'web'
			format: 'iife'
			splitting: false
			platform: 'browser'
		}

		client: {
			extends: 'web'
			splitting: true
		}

		css: {
			format: 'css'
			platform: 'browser'
			external: ['dependencies','devDependencies','!imba'] # dont exclude css deps?
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
			extends: 'base'
			format: 'esm'
			platform: 'worker'
			splitting: false
		}
		
		nodeworker: {
			extends: 'node'
			format: 'cjs'
			platform: 'node'
			splitting: false
		}

		webworker: {
			extends: 'base'
			format: 'esm'
			platform: 'webworker'
			splitting: false
		}
		
		serviceworker: {
			extends: 'base'
			format: 'esm'
			platform: 'webworker'
			splitting: false
			hashing: false
		}
	}
}

def clone object
	return object if object == undefined or object == null
	JSON.parse(JSON.stringify(object))

export def merge config, patch, ...up
	
	let otyp = typeof config
	let vtyp = typeof patch
	
	otyp = 'array' if config isa Array	
	vtyp = 'array' if patch isa Array
	
	let keytype = optionTypes[up[0]]
	
	if keytype == 'boolean'
		return patch

	if otyp == 'array'
		if vtyp == 'string'
			patch = patch.split(/\,\s*|\s+/g)
		
		let mod = patch.every do (/[\-\+]/).test($1 or '')
		let cloned = new Set(mod ? clone(config): [])

		for item in patch
			if item[0] == '+'
				cloned.add(item.slice(1))
			elif item[0] == '-'
				cloned.delete(item.slice(1))
			else
				cloned.add(item)
		
		return Array.from(cloned)	
		
	if config == null
		return clone(patch)

	for own key,value of patch
		config ||= {}

		if config.hasOwnProperty(key)
			config[key] = merge(config[key],value,key,...up)
		else
			# config[key] = merge(null,value,key,...up)
			config[key] = clone(value)

	return config

export def resolve config, cwd
	config = merge(clone(defaultConfig),config)
	return config
	
export def resolvePresets imbaconfig, config = {}, types = null
	if typeof types == 'string'
		types = types.split(',')

	let key = Symbol.for(types.join('+'))
	# let cacher = imbaconfig # resolveConfigPreset
	# if cacher[key]
	# 	return cacher[key]

	let base = Object.assign({presets: []},config)
	let presets = imbaconfig.options

	for typ in types
		let pre = presets[typ] or {}
		base.presets.push(typ)
		let curr = pre
		let add = [pre]
		# extends need to be smarter than this flat assign
		while curr.extends and add.length < 10
			add.unshift(curr = presets[curr.extends])
		for item in add
			# go through and assign each key instead?
			Object.assign(base,item)

	return base
	# return cacher[key] = base # Object.create(base)