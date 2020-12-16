import compiler from 'compiler'
import imba1 from 'compiler1'
import np from 'path'
import {SourceMapper} from '../compiler/sourcemapper'
import {resolveDependencies} from '../compiler/transformers'
import {StaticPool} from 'node-worker-threads-pool'

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

const pool = new StaticPool({
	size: 3,
	task: np.resolve(__dirname,'compiler-worker.js'),
	workerData: ""
})

export default class SourceFile
	def constructor src
		#cache = {}
		src = src
		out = {
			meta: mirrorFile('.meta')
			css: mirrorFile('.css')
			node: mirrorFile('.mjs')
			web: mirrorFile('.web.js')
			browser: mirrorFile('.web.js')
			transformed: mirrorFile('.trs.js')
		}
	
	get fs do src.fs
	get cwd do fs.cwd
	get program do #program ||= fs.program
	get config do program.config

	def mirrorFile ext
		let fs = fs
		fs.lookup((fs.outdir or '.') + '/' + src.rel + ext)

	# making sure that the actual body is there
	def prepare
		yes

	def readSource
		#cache.source ||= src.read!

	def invalidate
		#cache = {}
		self

	def load
		true
	
	def #compile o
		# check for cached version of this
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

			let out = await pool.exec(params)
			return out
			
			console.log 'returned from pool',out2
			if true

				let res = imba1.compile(code,o)
				return {id: src.id, js: res.js}

			else

				let out2 = await pool.exec(params)
				console.log 'returned from pool',out2

				let res = compiler.compile(code,o)
				let js = res.js
				let styles = res.css

				if styles
					js += "\nimport 'styles:{src.rel}'"

				return {id: src.id, js: js, css: styles}
