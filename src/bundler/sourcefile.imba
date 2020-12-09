import compiler from 'compiler'
import imba1 from 'compiler1'
import {SourceMapper} from '../compiler/sourcemapper'
import {resolveDependencies} from '../compiler/transformers'


const defaultConfig = {
	platform: 'node',
	format: 'esm',
	raw: true
	imbaPath: 'imba'
	styles: 'extern'
	hmr: true
	bundle: false
}

const defaults = {
	node: {
		ext: '.mjs'
	}

	web: {
		ext: '.js'
	}
}

export default class SourceFile
	def constructor src
		#cache = {}
		src = src
		out = {
			meta: mirrorFile('.meta')
			css: mirrorFile('.css')
			node: mirrorFile('.mjs')
			web: mirrorFile('.js')
		}
	
	get fs do src.fs
	get cwd do fs.cwd
	get program do fs.program
	get config do program.config

	def mirrorFile ext
		let fs = fs
		fs.lookup((fs.outdir or '.') + '/' + src.rel + ext)

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

	def prebuild {promise,resolver}, o = {}
		let jsfile = out.node
		let srctime = src.mtimesync
		let outtime = jsfile.scanned? ? jsfile.mtimesync : 0
		let manifest = {node: {}, web: {}}
		let fs = fs
		
		# the previous one was built earlier
		if outtime > srctime and outtime > program.mtime
			return true

		try
			# this makes the promises not work?
			let sourceBody = await src.read!
			let rawResults 

			for platform in ['node','web']
				# console.log "start compile! {src.rel}",platform,srctime,outtime
				let web = platform == 'web'
				let cfg = defaults[platform]
				let outfile = out[platform] # web ? webfile : jsfile # mirrorFile(cfg.ext)
				let meta = manifest[platform] 
				let imports = meta.imports ||= {}
				# should not always compile both

				let opts = Object.assign({
					platform: platform
					format: 'esm'
					raw: true
					sourcePath: src.rel
					sourceId: src.id
					cwd: cwd
					imbaPath: 'imba'
					styles: 'extern'
					hmr: true
					bundle: false
				},o)

				let legacy = (/\.imba1$/).test(src.rel)

				if legacy
					opts.filename = opts.sourcePath
					opts.target = platform #  == 'node' ? opts.platform : 'web'
					opts.inlineHelpers = 1

				if legacy
					let res = imba1.compile(sourceBody,opts)
					await outfile.write(res.js)
				else
					let res = rawResults or compiler.compile(sourceBody,opts)
					let js = res.js

					js = resolveDependencies(src.rel,js) do(args)
						# console.log 'args',src.rel,args
						let res = imports[args.path] = resolver.resolve(args)
						let path = res.path
						
						if res.namespace
							let file = fs.lookup(path)

							if file.imba
								path = res.remapped = file.imba.out[platform].rel

							let rel = resolver.relative(outfile.reldir,path)
							return rel
						
						return path or null

					if res.css.length
						if platform == 'node'
							await out.css.write(SourceMapper.strip(res.css))

						# need to resolve mappings?
						js += "\nimport './{out.css.name}'"
					await outfile.write(SourceMapper.strip(js))

					if res.universal
						rawResults = res
						# console.log 'no need to build for web as well!!'
						# break

			# console.log 'write manifest'
			await out.meta.write(JSON.stringify(manifest,null,2))
			# console.log 'imports',imports
		catch e
			console.log 'error',e
			yes
		return self


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
		console.log 'compiling!',src.abs
		let code = await precompile(o)
		if o.styles == 'import' and code.indexOf('HAS_CSS_STYLES') >= 0
			code += "\nimport '{src.abs}.css'"
		let out = SourceMapper.run(code,o)
		return out.code

	def getStyles o = {}
		let code = await cssfile.read!
		let out = SourceMapper.run(code,o)
		return out.code