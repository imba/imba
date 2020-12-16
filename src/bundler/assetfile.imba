import {parseAsset} from '../compiler/assets'

export default class AssetFile
	def constructor src
		src = src

	get fs do src.fs
	get cwd do fs.cwd
	get program do #program ||= fs.program
	get config do program.config

	def compile o = {}
		program.cache.load("{src.rel}:{o.format}",src.mtimesync) do
			let svgbody = await src.read!
			let parsed = parseAsset({body: svgbody})
			return {js: "export default {JSON.stringify(parsed)};"}