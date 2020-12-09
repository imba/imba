# const tscpaths = require "tsconfig-paths"
const micromatch = require 'micromatch'
const p = require 'path'


const testconfig = {
	paths: {
		"app/*": ["app/*"]
		"svg/*": ["assets/*","assets/feather/*"]
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
	'assets/logo.svg'
	'assets/check.svg'
	'assets/feather/check.svg'
]



const tests = {
	# [ importer, path, expected ]
	'app/index.imba':
		'./store': 'app/store.imba'
		'views/html': 'app/html.imba'
		'app/store': 'app/store.imba'
		'svg/logo': 'assets/logo.svg'
		'views/cards/item': 'app/views/cards/item.imba'
		'../assets/logo': 'assets/logo.svg'
}

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
		paths = config.paths or {}
		# {config,files,program} = o

		dirs = {}
		aliases = {}
		extensions = config.extensions or ['.imba','.ts','.js','.css','.svg','.json']
		resolve = resolve.bind(self)
		self

	def setup
		return unless #ready =? 1
		dirs = {}
		aliases = {}
		let t = Date.now!

		# this will take time to match
		for own dir, rules of paths
			let rels = dirs[dir] = []
			let prefix = dir.replace('/*','/')

			for rule in rules
				let replacer = rule.replace('/*','/')
				let matches = micromatch(files,[rule])
				for match in matches
					let alias = match.replace(replacer,prefix)
					let ext = alias.slice(alias.lastIndexOf('.'))
					let unprefixed = alias.replace(/\.\w+$/,'')
					aliases[alias] = [match]
					let wildcard = aliases[unprefixed] ||= []
					wildcard.push(match)
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
		let res = p.relative(dir,path)
		unless res[0] == '.'
			res = './' + res
		return res
	
	def resolve o
		setup!
		let inpath = o.path
		let found

		if found = aliases[inpath]
			return {path: aliases[inpath][0], namespace: 'file'}

		let rel? = inpath.match(/^\.+\//)

		# check if relative
		# let indir = importer.slice(0,importer.lastIndexOf('/') + 1) #  p.dirname(importer)
		
		if rel?
			let m = 0
			let norm = p.normalize(o.resolveDir + inpath)
			let found = aliases[norm]
			m = testWithExtensions(norm) or (aliases[norm] or [norm])[0]
			return {path: m, namespace: 'file'}

		return {path: inpath}

def run
	let resolver = new Resolver(config: testconfig, files: testfiles)
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