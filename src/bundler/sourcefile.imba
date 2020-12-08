import compiler from 'compiler'
import imba1 from 'compiler1'

export default class SourceFile
	def constructor src
		#cache = {}
		src = src
		out = src.tmp('.meta')

	get config do project.config
	
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
			

			if outstat.mtimeMs > srcstat.mtimeMs
				let body = await tmpfile.read!
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
				let serialized = null

				if legacy
					# imba1 file must be handled differently
					serialized = JSON.stringify({js: String(res.js), css: ""})
					res = compiler.deserialize(serialized,{sourcePath: src.rel})
				else
					serialized = res.serialize!

				console.log 't',Date.now! - t,src.rel,src.id
				# dont write this always?
				await tmpfile.write(serialized)
				# we want to save the raw js without parsing or removing sourcemap markers
				# so that we can modify the file etc before rerunning with sourcemap
				# memory hungry now?
				console.log 'write to',tmpfile.rel,res.js.length,sourceCode.length,Date.now! - t
				resolve(res)
			catch e
				resolve(errors: [])

	def compile o = {}
		# for now we expect
		let input = await precompile(o)
		unless input.recompile isa Function
			console.log 'recompile not function',o,src.rel,input.recompile

		return input.recompile(o)