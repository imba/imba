import compiler from 'compiler'
import imba1 from 'compiler1'
import {SourceMapper} from '../compiler/sourcemapper'

export default class SourceFile
	def constructor src
		#cache = {}
		src = src
		out = src.tmp('.meta')
		cssfile = src.tmp('.css')
		nodefile = src.tmp('.mjs')
		webfile = src.tmp('.js')

	get config do project.config

	get program
		src.program
	
	get fs
		src.fs

	get cwd
		src.fs.cwd

	def mirrorFile ext
		fs.lookup(src.rel + ext)

	# making sure that the actual body is there
	def prepare
		await precompile!

	def readSource
		#cache.source ||= src.read!

	def invalidate
		let prevBody = #cache.source
		#cache = {}
		srcstat = outstat = null
		setTimeout(&,20) do precompile!
		self

	def prebuild
		let dest = fs.lookup(src.rel + '.mjs')
		build(dest,platform: 'node')

	def build dest, o = {}
		#cache[dest] ||= new Promise do(resolve,reject)
			let opts = Object.assign({
				platform: '',
				format: 'esm',
				raw: true
				sourcePath: src.rel,
				sourceId: src.id,
				cwd: cwd,
				imbaPath: 'imba'
				styles: 'extern'
				hmr: true
				bundle: false
			},o)

			let t = Date.now!
			
			mtsrc ||= await src.mtime!
			let mtdest = await dest.mtime!

			if mtdest > mtsrc and mtdest > program.mtime
				let body = await dest.read!
				return resolve(body)

			try
				let legacy = (/\.imba1$/).test(src.rel)
				let lib = legacy ? imba1 : compiler
			
				let sourceCode = await readSource!

				if legacy
					opts.filename = opts.sourcePath
					opts.target = opts.platform
					opts.inlineHelpers = 1

				let res = lib.compile(sourceCode,opts)
				console.log 'compiling',src.rel

				if legacy
					await dest.write(res.js)
				else
					let js = res.js
					if res.css.length
						let cssfile = mirrorFile('.css')
						await cssfile.write(SourceMapper.strip(res.css))
						js += "\nimport './{cssfile.name}'"
				
					await dest.write(SourceMapper.strip(js))

					# possibly also build one for web?

				# console.log 't',Date.now! - t,src.rel,src.id
				# console.log 'write to',dest.rel,res.js.length,sourceCode.length,Date.now! - t
				resolve(res.js)
			catch e
				resolve(errors: [])

	def precompile o = {}
		# let key -- get a key based on the options
		o.platform ||= 'browser'
		let key = o.platform
		#cache[key] ||= new Promise do(resolve,reject)
			let opts = Object.assign({
				platform: platform,
				format: 'esm',
				raw: true
				sourcePath: src.rel,
				sourceId: src.id,
				cwd: cwd,
				imbaPath: 'imba'
				styles: 'extern'
				hmr: true
				bundle: false
			},o)

			# slow?
			let tmpfile = src.tmp(".{key}")
			let t = Date.now!
			mtsrc ||= await src.mtime!
			let mtdest = await tmpfile.mtime!

			if mtdest > mtsrc and mtdest > program.mtime
				let body = await tmpfile.read!
				return resolve(body)

				let result = compiler.deserialize(body,{sourcePath: src.rel})
				return resolve(result)

			try
				let legacy = (/\.imba1$/).test(src.rel)
				let lib = legacy ? imba1 : compiler
			
				let sourceCode = await readSource!

				if legacy
					opts.filename = opts.sourcePath
					opts.target = opts.platform
					opts.inlineHelpers = 1

				let res = lib.compile(sourceCode,opts)
				console.log 'compiling',src.rel

				if legacy
					tmpfile.write(res.js)
				else
					tmpfile.write(SourceMapper.strip(res.js))
					console.log 'write css',src.rel,res.css.length
					cssfile.write(SourceMapper.strip(res.css)) if res.css

				console.log 't',Date.now! - t,src.rel,src.id
				console.log 'write to',tmpfile.rel,res.js.length,sourceCode.length,Date.now! - t
				resolve(res.js)
			catch e
				resolve(errors: [])

	def compile o = {}
		# for now we expect
		console.log 'compiling!'
		let code = await precompile(o)
		if o.styles == 'import' and code.indexOf('HAS_CSS_STYLES') >= 0
			code += "\nimport '{src.abs}.css'"
		let out = SourceMapper.run(code,o)
		return out.code

	def getStyles o = {}
		let code = await cssfile.read!
		let out = SourceMapper.run(code,o)
		return out.code