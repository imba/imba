import * as esbuild from 'esbuild'

export default class Resolver
	
	def constructor bundler, options = {}
		#bundler = bundler
		#plugin = {
			name: 'imba-resolve'
			setup: do(esb) setup(esb)
		}
		#options = options
		#counter = 0
		#cache = {}
		#queue = []
		#next = null
		#handling = [0,0,(do yes)]

	def setup esb
		esb.onLoad(filter: /.*/, namespace: 'file') do({path})
			#cache[#handling[3]] = path
			#handling[2](path)
			
			let next = #queue.shift!
			next ||= await new Promise do(resolve)
				#waiting = do(data)
					#waiting = null
					resolve(data)

			#handling = next
			if !next[0]
				return {contents: "", loader: "js"}
			else
				{contents: "import '{next[0]}?{++#counter}'", loader: "js", resolveDir: next[1]}
		
	def reset
		let next = #handling = #queue.shift!
		let o = #options
		#esb = esbuild.build({
			stdin: {
				contents: "import '{next[0]}'"
				resolveDir: next[1]
				loader: 'js'
			},
			write: false,
			bundle: true,
			outfile: 'out.js',
			logLevel: 'silent',
			plugins: [#plugin],
			loader: { '.png': 'binary' },
			...o
		})
		try
			let res = await #esb
		catch e
			if e
				#cache[#handling[3]] = null
				#handling[2](null)
				#esb = null
				reset! if #queue.length
			
	def resolve path, dir
		let key = "{dir}:{path}"
		new Promise do(resolve,reject)
			let item = [path,dir,resolve,key]
			let cached = #cache[key]
			if  cached !== undefined
				return resolve(cached)

			if #waiting
				# p 'already waiting'
				#waiting(item)
			else
				# p 'add to queue'
				#queue.push(item)
				try
					reset! unless #esb
				catch e
					yes
	
	def stop
		if #waiting
			#waiting([])
		elif #esb
			#queue.push([])
		#stopped = yes
		return self
			
		
