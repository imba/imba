# const tscpaths = require "tsconfig-paths"
const micromatch = require 'micromatch'
const np = require 'path'


const testconfig = {
	paths: {
		"app/*": ["app/*"]
		"svg/*": ["app/assets/*","assets/feather/*"]
		"svg/icons/*": ["assets/feather/*"]
		"env": ["app/env.imba"]
		"views/*": ["app/*","app/views/*"]
	}
	rootDirs: ["src/views", "generated/templates/views"]
}

const testfiles = [
	'app/index.imba'
	'app/store.imba'
	'app/html.imba'
	'app/views/menu.imba'
	'app/views/cards/item.imba'
	'app/assets/logo.svg'
	'app/assets/check.svg'
	'assets/feather/check.svg'
]



const tests = {
	# [ importer, path, expected ]
	'app/index.imba':
		'./store': 'app/store.imba'
		'views/html': 'app/html.imba'
		'app/store': 'app/store.imba'
		'svg/logo': 'app/assets/logo.svg'
		'svg/logo.svg': 'app/assets/logo.svg'
		'views/cards/item': 'app/views/cards/item.imba'
		'./assets/logo': 'app/assets/logo.svg'
}

class PathEntry

	def constructor key, mappings
		key = key
		pre = key.replace(/\*$/,'')
		mappings = mappings
		cache = {}
	
	def match path	
		if path.indexOf(pre) == 0
			let sub = path.slice(pre.length)
			mappings.map do $1.replace('*',sub)
		else
			null
	

export class Resolver
	prop config
	prop files
	prop program

	# def constructors
	# 	super
	# 	cleanup = tscpaths.register({
	# 		baseUrl: './'
	# 		paths: config.paths
	# 	})

	def constructor o = {}
		# not using new fields?!
		# need to upgrade the bootstrapper
		config = o.config
		files = o.files
		program = o.program
		fs = o.fs
		paths = config.paths or {}
		# {config,files,program} = o

		dirs = {}
		aliases = {}
		cache = {}
		extensions = config.extensions or ['','.imba','.imba1','.ts','.js','.css','.svg','.json']
		resolve = resolve.bind(self)
		self

	def setup
		return unless #ready =? 1
		dirs = {}
		aliases = {}
		entries = []
		let t = Date.now!

		
		# this will take time to match
		for own dir, rules of paths
			entries.push( new PathEntry(dir,rules) )
			let rels = dirs[dir] = []
			let prefix = dir.replace('/*','/')
			dirs[prefix.replace(/\/\*?$/)] = rels

			for rule in rules
				let replacer = rule.replace('/*','/')
				let matches = micromatch(files,[rule])
				for match in matches
					let alias = match.replace(replacer,prefix)
					let stripped = match.replace(replacer,'')

					let ext = alias.slice(alias.lastIndexOf('.'))
					aliases[alias] = [match]

					let unprefixed = alias.replace(/\.\w+$/,'')
					let wildcard = aliases[unprefixed] ||= []
					wildcard.push(match)

		pathsMatcher = new RegExp("^({entries.map(do $1.pre).join('|')})")
		# console.log pathsMatcher
		# console.log aliases
		# console.log 'resolver setup',Date.now! - t,aliases

		return

	
	def find test
		for file in files
			continue unless file.match(test)
			file

	def testWithExtensions path, exts = extensions
		return path if files.indexOf(path) >= 0
			
		for ext in exts
			let m = path + ext
			return m if files.indexOf(m) >= 0
		return null

	def relative dir, path
		# console.log 'relative!!!',dir,path
		let res = np.relative(dir,path)
		unless res[0] == '.'
			res = './' + res
		return res

	def expand path
		if cache[path]
			return cache[path]
		setup!
		let test = []
		for entry in entries
			if let m = entry.match(path)
				for item in m
					test.push(item)
					for ext in extensions
						test.push(item + ext)
				# test.push(...m)
		return cache[path] = test
	
	def resolve o, options = null
		setup!
		let path = o.path
		let found
		let namespace = 'file'
		let colonIndex = path.indexOf(':')
		let qIndex = path.indexOf('?')
		let query = ''

		if colonIndex >= 0
			namespace = path.substr(0,colonIndex)
			# path = path.replace(':','/')
			path = path.slice(colonIndex + 1)

		if qIndex > 0
			query = path.slice(qIndex)
			path = path.slice(0,qIndex)
			# [path,query] = path.split('?')

		# if found = aliases[path]
		#	return {path: aliases[path][0], namespace: namespace}

		let rel? = path.match(/^\.+\//)

		if rel?
			# return {path: inpath}
			let m = 0
			let norm = np.resolve(o.resolveDir,path) # abs
			# let found = aliases[norm]
			# m = testWithExtensions(norm) or (aliases[norm] or [norm])[0]
			# console.log 'resolve?!',norm,o.resolveDir,path

			for ext in extensions
				let m = norm + ext
				if fs.existsSync(m)
					# console.log 'resolved with ext!',fs.relative(test)
					let rel = fs.relative(m)
					path = namespace == 'file' ? m : rel
					return {path: path, namespace: namespace, #abs: m + query, #rel: rel}

			return {path: fs.relative(m), namespace: namespace}

		elif !pathsMatcher.test(path)
			return null

		elif fs
			for m in expand(path)
				# should this be synchronous?
				# if lookupMap
				#	lookupMap[m] = yes

				if fs.existsSync(m)
					# check for correct extensions here as well?
					let abs = fs.resolve(m)
					path = namespace == 'file' ? abs : m
					return {path: path, namespace: namespace, #abs: abs + query, #rel: m}
			return null

		return {path: path, namespace: namespace}

def run
	let resolver = new Resolver(config: testconfig, files: testfiles)

	console.log resolver.expand("svg/icons/test")

	for own importer, paths of tests
		for own raw, expected of paths
			
			let res = resolver.resolve({
				importer: importer
				resolveDir: importer.slice(0,importer.lastIndexOf('/') + 1)
				path: raw
			})
			res = res.path
			# console.log 'testing',importer,raw,expected,res
			unless expected == res
				console.warn "ERROR",expected,res
# run!