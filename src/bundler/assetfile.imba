import {parseAsset} from '../compiler/assets'

export default class AssetFile
	def constructor src
		#cache = {}
		src = src
		out = {
			js: mirrorFile('.js')
		}

	# add this file to the things we need to build / transpile
	def register
		self
	
	get fs do src.fs
	get cwd do fs.cwd
	get program do #program ||= fs.program
	get config do program.config

	def mirrorFile ext
		let fs = fs
		# outdir is not shared for the whole fs?
		fs.lookup((fs.outdir or '.') + '/' + src.rel + ext)

	def #compile o = {}
		program.cache.load("{src.rel}:{o.format}",src.mtimesync) do
			let svgbody = await src.read!
			let parsed = parseAsset({body: svgbody})
			return {js: "export default {JSON.stringify(parsed)};"}

	def load
		# program should be implied, no?
		# run as a full-blown promise?
		#cache.load ||= program.queue(#load!)

	def #load
		let srctime = src.mtimesync
		let outtime = out.js.mtimesync
		let fs = fs

		console.log 'asset loaded!!',src.rel,out.js.rel

		# the previous one was built earlier
		if outtime > srctime and outtime > program.mtime
			return Promise.resolve(yes)
		
		let svgbody = await src.read!

		let parsed = parseAsset({body: svgbody})
		# console.log 'parsed asset',parsed

		let js = "export default {JSON.stringify(parsed)};"

		await out.js.write js

		return Promise.resolve(yes)