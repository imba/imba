const optionTypes = {
	esbuild: 'object'
	external: 'array'
	hashing: 'boolean'
	minify: 'boolean'
	target: 'array'
}

export const LOADER_SUFFIXES = {
	raw: 'text'
	text: 'text'
	copy: 'copy'
	dataurl: 'dataurl'
	binary: 'binary'
	file: 'file'
	url: 'file'
	base64: 'base64'
}

export const SUFFIX_TEMPLATES = {
	worker: {web: 'worker.js', node: null}
	sharedworker: {web: 'sharedworker.js', node: null}
	# "worker-url": {web: 'workerurl.js', node: null}
}

export const NODE_BUILTINS = [
	"assert",
	"async_hooks",
	"buffer",
	"child_process",
	"cluster",
	"console",
	"constants",
	"crypto",
	"dgram",
	"dns",
	"domain",
	"events",
	"fs",
	"fs/promises",
	"http",
	"http2",
	"https",
	"inspector",
	"module",
	"net",
	"os",
	"path",
	"perf_hooks",
	"process",
	"punycode",
	"querystring",
	"readline",
	"repl",
	"stream",
	"string_decoder",
	"sys",
	"timers",
	"tls",
	"trace_events",
	"tty",
	"url",
	"util",
	"v8",
	"vm",
	"worker_threads",
	"zlib"
]


export const LOADER_EXTENSIONS = {
	".png": "file",
	".bmp": "file",
	".apng": "file",
	".webp": "file",
	".heif": "file",
	".avif": "file",
	".svg": "file",
	".gif": "file",
	".jpg": "file",
	".jpeg": "file",
	".ico": "file",
	".woff2": "file",
	".woff": "file",
	".eot": "file",
	".ttf": "file",
	".otf": "file",
	".html": "text",
	".webm": "file",
	".weba": "file",
	".avi": "file",
	".mp3": "file",
	".mp4": "file",
	".m4a": "file",
	".mpeg": "file",
	".wav": "file",
	".ogg": "file",
	".ogv": "file",
	".oga": "file",
	".opus": "file"
}


export const defaultConfig = {
	bundles: []

	options: {
		base: {
			target: ['chrome88','edge79','safari15']
		}
		node: {
			extends: 'base'
			platform: 'node'
			format: 'cjs'
			sourcemap: true
			target: ['node14.13.0']
			external: ['dependencies','!imba']
		}

		esm: {
			extends: 'node'
			format: 'esm'
			splitting: false
		}

		web: {
			extends: 'base'
			platform: 'browser'
			sourcemap: true
			format: 'esm'
			splitting: true
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
		}

		worker: {
			extends: 'base'
			format: 'esm'
			platform: 'webworker'
			splitting: false
		}

		nodeworker: {
			extends: 'node'
			format: 'cjs'
			platform: 'node'
			splitting: false
		}

		sharedworker: {
			extends: 'base'
			format: 'esm'
			platform: 'webworker'
			splitting: false
		}

		serviceworker: {
			extends: 'base'
			format: 'iife'
			platform: 'webworker'
			entryNames: "[name]"
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

	if otyp == 'string' and vtyp == 'string'
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