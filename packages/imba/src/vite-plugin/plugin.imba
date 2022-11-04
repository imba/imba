import type { CompileData } from './utils/compile.ts'
import svgPlugin from "./svg-plugin";
import type { Plugin, HmrContext } from "vite";
import {transformWithEsbuild} from 'vite'
import { buildIdParser,  normalize, injectQuery } from "./utils/id";
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
import { resolveViaPackageJsonImba } from "./utils/resolve";
import { ensureWatchedFile, setupWatchers } from "./utils/watch";
import { handleImbaHotUpdate } from './handle-imba-hot-update';
import url from 'node:url'
import np from 'node:path'

const allCssModuleId = 'virtual:imba/*?css'
const resolvedAllCssModuleId = "\0{allCssModuleId}"

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

	validateInlineOptions(inlineOptions)
	const cache = new VitePluginImbaCache();

	const plugins\Plugin[] = []

	def config(config, configEnv)
		if process.env.DEBUG
			log.setLevel("debug")
		elif config.logLevel
			log.setLevel(config.logLevel)
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
		compileImba = createCompileImba(options);
		viteConfig = config;
		# // TODO deep clone to avoid mutability from outside?
		api.options = options;
		log.debug("resolved options", options);

	def transform(code, id, opts)
		const ssr = !!opts..ssr;
		const imbaRequest = requestParser(id, ssr);
		
		return if !imbaRequest or imbaRequest.query.imba

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
			compiledData.compiled.js = await transformWithEsbuild compiledData.compiled.js.code, imbaRequest.normalizedFilename.replace(".imba", ".js"), {format:"iife"}
			compiledData.compiled.js.code = "const body = {JSON.stringify compiledData.compiled.js.code}; export default \{body: body\}; export \{body\}"

		return {
			...compiledData.compiled.js,
			meta: 
				vite:
					lang: compiledData.lang
		}
	
	def resolveId(id, importer, opts)
		let ssr = !!opts..ssr or options.ssr
		ssr = no if test?
		const imbaRequest = requestParser(id, ssr)
		return resolvedAllCssModuleId if id == allCssModuleId or id == "*?css" or id == "*"
		if imbaRequest..query.imba
			if imbaRequest.query.type === "style"
				log.debug "resolveId resolved virtual css module {imbaRequest.cssId}"
				return imbaRequest.cssId
			log.debug "resolveId resolved {id}"
			return id
		if ssr and id === "imba"
			if !resolvedImbaSSR
				resolvedImbaSSR = this.resolve("imba/server", undefined, skipSelf: true).then do(imbaSSR)
					log.debug "resolved imba to imba/server"
					return imbaSSR
			return resolvedImbaSSR
		try
			const resolved = resolveViaPackageJsonImba(id, importer, cache)
			if resolved
				log.debug "resolveId resolved ${resolved} via package.json imba field of {id}"
				return resolved
		catch e
			log.debug.once "error trying to resolve {id} from {importer} via package.json imba field ", e

	def load(id, opts)
		const ssr = !!opts..ssr
		if id.includes("?url&entry")
			const path = np.relative(viteConfig.root, id.replace('?url&entry', ''))			
			return "export default '{path}'"
		const imbaRequest = requestParser(id, !!ssr)
		if resolvedAllCssModuleId == id 
			return 'export default ".dev-ssr/all.css"' if dev?
			if build?
				# empty style tag in production
				# we could include critical css at some point
				return "export default ''"
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
	# plugins.push iifePlugin!

	plugins
		
