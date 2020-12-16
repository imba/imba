import np from 'path'

const defaultConfig = {
	platform: 'node',
	format: 'esm',
	raw: true
	imbaPath: 'imba'
	styles: 'extern'
	hmr: true
	bundle: false
}

export default class SourceFile
	def constructor src
		src = src

	get fs do src.fs
	get cwd do fs.cwd
	get program do #program ||= fs.program
	get config do program.config
	get log do program.log

	# making sure that the actual body is there
	def prepare
		yes
	
	def compile o
		program.cache.load("{src.rel}:{o.platform}",src.mtimesync) do
			o = Object.assign({},defaultConfig,{
				sourcePath: src.rel,
				sourceId: src.id,
				cwd: cwd
			},o)

			let code = await src.read!
			let params = {
				code: code
				options: o
				type: 'imba'
			}

			if (/\.imba1$/).test(src.rel)
				o.filename = o.sourcePath
				o.target = o.platform #  == 'node' ? opts.platform : 'web'
				o.inlineHelpers = 1
				params.type = 'imba1'
			let t = Date.now!
			let out = await program.workers.exec('compile', [params])
			log.success 'compile %path in %ms',src.rel,Date.now! - t
			return out