import compiler from 'compiler'
import imba1 from 'compiler1'

export default class SourceFile
	def constructor src
		#cache = {}
		src = src
		out = src.tmp!

	get config do project.config
	
	get cwd
		src.fs.cwd

	# making sure that the actual body is there
	def prepare
		# srcstat = await src.stat!
		# outstat = await out.stat!
		# console.log 'preparing?',src.rel,out.rel,srcstat,outstat
		# console.log srcstat,outstat
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
		#cache.result ||= new Promise do(resolve,reject)
			# console.log 'compiling!'
			# check the timings
			let opts = Object.assign({
				platform: 'browser',
				format: 'esm',
				sourcePath: src.rel,
				cwd: cwd,
				imbaPath: 'imba'
				# config: config
				styles: 'extern'
				hmr: true
				bundle: false
				# assets: config.#assets
			},o)

			# slow?
			srcstat ||= await src.stat!
			outstat ||= await out.stat!

			if outstat.mtimeMs > srcstat.mtimeMs
				let body = await out.read!
				return resolve(body)

			try
				let legacy = (/\.imba1$/).test(src.rel)
				let lib = legacy ? imba1 : compiler
			
				let sourceCode = await readSource!

				if legacy
					opts.filename = opts.sourcePath
					opts.inlineHelpers = 1


				let res = lib.compile(sourceCode,opts)
				console.log 'write to',out.rel,res.js.length,sourceCode.length
				await out.write(res.js) # outfs.writePath(outfile,res.js)
				# we want to save the raw js without parsing or removing sourcemap markers
				# so that we can modify the file etc before rerunning with sourcemap
				resolve(res.js)
				# let out = utils.rename(src,'*.imba.mjs')
			catch e
				resolve(errors: [])

