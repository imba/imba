import compiler from 'compiler'
import imba1 from 'compiler1'
import {SourceMapper} from '../compiler/sourcemapper'

export default class SourceFile
	def constructor src
		#cache = {}
		src = src
		out = src.tmp('.meta')
		cssfile = src.tmp('.css')

	get config do project.config

	get program
		src.program
	
	get cwd
		src.fs.cwd

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
			srcstat ||= await src.stat!
			let outstat = await tmpfile.stat!

			if outstat.mtimeMs > srcstat.mtimeMs and outstat.mtimeMs > program.mtime
				let body = await tmpfile.read!
				# could check body to see if we do have css?
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
					# imba1 file must be handled differently
					# serialized = JSON.stringify({js: String(res.js), css: ""})
					# res = compiler.deserialize(serialized,{sourcePath: src.rel})
					# res = {js: res.js}
					tmpfile.write(res.js)
				else
					# serialized = res.serialize!
					tmpfile.write(res.js)
					console.log 'write css',src.rel,res.css.length
					cssfile.write(res.css) if res.css

				console.log 't',Date.now! - t,src.rel,src.id
				# dont write this always?
				# await tmpfile.write(serialized)

				# we want to save the raw js without parsing or removing sourcemap markers
				# so that we can modify the file etc before rerunning with sourcemap
				# memory hungry now?
				console.log 'write to',tmpfile.rel,res.js.length,sourceCode.length,Date.now! - t
				resolve(res.js)
			catch e
				resolve(errors: [])

	def compile o = {}
		# for now we expect
		let code = await precompile(o)
		if o.styles == 'import' and code.indexOf('HAS_CSS_STYLES') >= 0
			# console.log 'add css import when compiling',src.abs
			code += "\nimport '{src.abs}.css'"
		let out = SourceMapper.run(code,o)
		return out.code

	def getStyles o = {}
		let code = await cssfile.read!
		let out = SourceMapper.run(code,o)
		return out.code