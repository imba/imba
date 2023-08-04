import type { CompileData } from './utils/compile.ts'
import svgPlugin from "./svg-plugin";
import cucumberPlugin, {parseFeatureIntoSteps} from "./cucumber-plugin";
import type { Plugin, HmrContext } from "vite";
import {normalizePath} from 'vite'
import * as esbuild from 'esbuild'
import { buildIdParser,  normalize, injectQuery, parseRequest } from "./utils/id";
import type { IdParser, ImbaRequest } from "./utils/id";
import { log, logCompilerWarnings } from "./utils/log";
import { createCompileImba } from "./utils/compile";
import type { CompileData } from "./utils/compile";
import {
	buildExtraViteConfig,
	patchResolvedViteConfig,
	preResolveOptions,
	resolveOptions,
	validateInlineOptions
} from "./utils/options";
import type  {Options, ResolvedOptions } from './utils/options'
import { toRollupError } from "./utils/error";
import { VitePluginImbaCache } from "./utils/vite-plugin-imba-cache";
import { ensureWatchedFile, setupWatchers } from "./utils/watch";
import { handleImbaHotUpdate } from './handle-imba-hot-update';
import url, {pathToFileURL, fileURLToPath} from 'node:url'
import np from 'node:path'
import nfs from 'node:fs'
import crypto from 'node:crypto'
import {getConfigFilePath} from '../utils/vite.imba'

import vitePluginEnvironment from './vite-plugin-environment.ts'

export {vitePluginEnvironment, parseFeatureIntoSteps}
export { setupVite } from './setupVite'

const allCssModuleId = 'virtual:imba/*?css'
const resolvedAllCssModuleId = "\0{allCssModuleId}"

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
# from bundler/utils.imba
export def getImbaHash
	const hash = crypto.createHash('sha256')
	const files = nfs.readdirSync(__dirname)
	files.sort()
	for file of files
		const filePath = np.join(__dirname, file);

		if np.extname(file) === '.mjs'
			const data = nfs.readFileSync(filePath);
			hash.update(data)
	hash.digest 'hex'
	
export def getCacheDir
	# or just the directory of this binary?
	let dir = process.env.IMBA_CACHEDIR or np.resolve(__dirname,'.imba-cache')
	unless nfs.existsSync(dir)
		console.log 'cache dir does not exist - create',dir
		nfs.mkdirSync(dir)
	return dir

const IMBA_HASH = getImbaHash!
const CACHE_DIR = getCacheDir!

export default def imbaPlugin(inlineOptions\Partial<Options> = {})
	let name = "vite-plugin-imba"
	let enforce = "pre"
	let requestParser\IdParser;
	let compileImba\( (imbaRequest: ImbaRequest,code: string,options: Partial<ResolvedOptions>,) => Promise<CompileData>)
	let options\ResolvedOptions
	let viteConfig\ResolvedConfig;
	let api\PluginAPI = {}
	let resolvedImbaSSR\Promise<PartialResolvedId | null>;
	let test?\boolean
	let build?\boolean
	let dev?\boolean
	let imbaConfig
	validateInlineOptions(inlineOptions)
	const cache = new VitePluginImbaCache();

	const plugins\Plugin[] = []

	def config(config, configEnv)
		if process.env.DEBUG
			log.setLevel("debug")
		elif config.logLevel
			log.setLevel(config.logLevel)
		imbaConfig ||= (await getConfigFilePath("imba")) || {}
		options = await preResolveOptions(inlineOptions, config, configEnv)
		const extraViteConfig = buildExtraViteConfig(options, config);
		log.debug("additional vite config", extraViteConfig);
		test? = configEnv.mode === "test"
		build? = configEnv.mode === "production"
		dev? = configEnv.mode === "development"
		extraViteConfig;

	def configResolved(config)
		options = resolveOptions(options, config);
		# patchResolvedViteConfig(config, options);
		requestParser = buildIdParser(options);
		compileImba = createCompileImba(options, imbaConfig);
		viteConfig = config;
		# // TODO deep clone to avoid mutability from outside?
		api.options = options;
		log.debug("resolved options", options);

	def transform(code, id, opts)
		const ssr = !!opts..ssr;
		const imbaRequest = requestParser(id, ssr);
		
		return if !imbaRequest or imbaRequest.query.imba

		let hash
		let cacheFile
		try
			hash = crypto.createHash('md5').update(JSON.stringify(options.server.config) + code + id + IMBA_HASH + JSON.stringify imbaConfig).digest('hex')
			cacheFile = np.join(CACHE_DIR, hash);
			const r = await nfs.promises.readFile(cacheFile, 'utf-8');
			return JSON.parse r

		let compiledData\CompileData
		try compiledData = await compileImba(imbaRequest, code, options) catch e
			cache.setError(imbaRequest, e);
			throw toRollupError(e, options);
		logCompilerWarnings
			imbaRequest,
			compiledData.compiled.warnings,
			options,
		cache.update(compiledData)
		if compiledData.dependencies.length and options.server
			compiledData.dependencies.forEach do(d)
				ensureWatchedFile options.server.watcher, d, options.root

		log.debug "transform returns compiled js for {imbaRequest.filename}"
		if imbaRequest.query.iife
			const code = compiledData.compiled.js.code
			const res = await esbuild.build
				bundle: yes
				platform: 'browser'
				format: "iife"
				stdin: {contents: code, resolveDir: process.cwd!}
				write: no				
			const newCode =  res.outputFiles[0].text
			compiledData.compiled.js = code: "const body = {JSON.stringify newCode}; export default \{body: body\}; export \{body\}"

		const result = {
			...compiledData.compiled.js,
			meta: 
				vite:
					lang: compiledData.lang
		}
		try nfs.writeFile(cacheFile, JSON.stringify(result), do 1)
		return result
	
	def resolveId(id, importer, opts)
		let ssr = !!opts..ssr or options.ssr
		# ssr = no if test?
		const imbaRequest = requestParser(id, ssr)
		return resolvedAllCssModuleId if id == allCssModuleId or id == "*?css" or id == "*"
		if imbaRequest..query.imba
			if imbaRequest.query.type === "style"
				log.debug "resolveId resolved virtual css module {imbaRequest.cssId}"
				return imbaRequest.cssId
			log.debug "resolveId resolved {id}"
			return id
		const req = parseRequest(id, ssr)
		if req..external !== undefined
			let keys = []
			for k,v in Object.keys(req)
				keys.push "{k}={v}" unless k == 'external'
			if keys.length
				id = id.split("?")[0] + "?{keys.join('&')}"
			else
				id = id.split("?")[0]
			const resolution = await this.resolve(id, importer, {skipSelf: yes, ...opts})
			return {...resolution, external: yes}
		
	def load(id, opts)
		const ssr = !!opts..ssr

		if np.isAbsolute id
			const url = new URL("file://{id}")
			const params = new URLSearchParams(url.search)
			if params.has('url') and params.has('entry')
				params.delete('url')
				params.delete('entry')
				url.search = params.toString!
				let path = normalizePath url.toString!.replace("file://", '')
				path = np.relative(viteConfig.root, path)
				return "export default '{path}'"

		const imbaRequest = requestParser(id, !!ssr)
		if resolvedAllCssModuleId == id 
			return "export default ''"
			# return 'export default ".dev-ssr/all.css"' if dev?
			# if build?
			# 	# empty style tag in production
			# 	# we could include critical css at some point
			# 	return "export default ''"
		if imbaRequest
			const {filename: filename, query: query} = imbaRequest
			if query.imba and query.type === "style"
				const _css = cache.getCSS(imbaRequest)
				if _css
					log.debug "load returns css for {filename}"
					return _css
				else
					console.log "cache empty: loading {id}"


			if viteConfig.assetsInclude(filename)
				log.debug "load returns raw content for {filename}"
				return fs.readFileSync(filename, "utf-8")

	def configureServer(server)
		options.server = server
		setupWatchers options, cache, requestParser

	def handleHotUpdate(ctx\HmrContext)
		if !options.hot or !options.emitCss
			return
		const imbaRequest = requestParser(ctx.file, false, ctx.timestamp)
		if imbaRequest
			try
				await handleImbaHotUpdate(compileImba, ctx, imbaRequest, cache, options)
			catch e
				throw toRollupError(e, options)

	plugins.push svgPlugin!
	plugins.push
		name: "vite-plugin-imba"
		enforce: "pre"
		api: api
		config: config
		configResolved: configResolved
		transform: transform
		load: load
		resolveId: resolveId
		configureServer: configureServer
		handleHotUpdate: handleHotUpdate

	plugins.push cucumberPlugin! if process.env.VITEST

	plugins
		
