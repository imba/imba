import type { CompileData } from './utils/compile.ts'
import svgPlugin from "./svg-plugin";
import type { Plugin, HmrContext } from "vite";
import { buildIdParser, IdParser, ImbaRequest, normalize } from "./utils/id";
import { log, logCompilerWarnings } from "./utils/log";
import { CompileData, createCompileImba } from "./utils/compile";
import {
	buildExtraViteConfig,
	Options,
	patchResolvedViteConfig,
	preResolveOptions,
	ResolvedOptions,
	resolveOptions,
	validateInlineOptions,
} from "./utils/options";
import { toRollupError } from "./utils/error";
import { VitePluginImbaCache } from "./utils/vite-plugin-imba-cache";
import { resolveViaPackageJsonImba } from "./utils/resolve";
import { ensureWatchedFile, setupWatchers } from "./utils/watch";
import { handleImbaHotUpdate } from './handle-imba-hot-update';
import url from 'url'

export def imba(inlineOptions\Partial<Options> = {})
	let name = "vite-plugin-imba"
	let enforce = "pre"
	let requestParser\IdParser;
	let compileImba\( (imbaRequest: ImbaRequest,code: string,options: Partial<ResolvedOptions>,) => Promise<CompileData>)
	let options\ResolvedOptions
	let viteConfig\ResolvedConfig;
	let api\PluginAPI = {}
	let resolvedImbaSSR\Promise<PartialResolvedId | null>;

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
		return {
			...compiledData.compiled.js,
			meta: 
				vite:
					lang: compiledData.lang
		}
		
	def load(id, opts)
		const ssr = !!opts..ssr
		const imbaRequest = requestParser(id, !!ssr)
		if imbaRequest
			const {filename: filename, query: query} = imbaRequest
			if query.imba and query.type === "style"
				const _css = cache.getCSS(imbaRequest)
				if _css
					log.debug "load returns css for {filename}"
					return _css
			if viteConfig.assetsInclude(filename)
				log.debug "load returns raw content for {filename}"
				return fs.readFileSync(filename, "utf-8")
	
	def resolveId(importee, importer, opts)
		const ssr = !!opts..ssr
		const imbaRequest = requestParser(importee, ssr)
		if imbaRequest..query.imba
			if imbaRequest.query.type === "style"
				log.debug "resolveId resolved virtual css module {imbaRequest.cssId}"
				return imbaRequest.cssId
			log.debug "resolveId resolved {importee}"
			return importee
		if ssr and importee === "imba"
			if !resolvedImbaSSR
				resolvedImbaSSR = this.resolve("imba/server", undefined, skipSelf: true).then do(imbaSSR)
					log.debug "resolved imba to imba/server"
					return imbaSSR
			return resolvedImbaSSR
		try
			const resolved = resolveViaPackageJsonImba(importee, importer, cache)
			if resolved
				log.debug "resolveId resolved ${resolved} via package.json imba field of {importee}"
				return resolved
		catch e
			log.debug.once "error trying to resolve {importee} from {importer} via package.json imba field ", e
	def configureServer(server)
		options.server = server
		# Breaks tests, do not use until Vite has a proper fix
		# server.middlewares.use do(req, res, next)
		# 	const pathname = url.parse(req.url).pathname;
		# 	if pathname.endsWith ".imba"
		# 		req.url += "?import"
		# 		res.setHeader "Content-Type", "application/javascript"
		# 	next()
		setupWatchers options, cache, requestParser
	def handleHotUpdate(ctx\HmrContext)
		if !options.hot or !options.emitCss
			return
		const imbaRequest = requestParser(ctx.file, false, ctx.timestamp)
		if imbaRequest
			try
				const r = await handleImbaHotUpdate(compileImba, ctx, imbaRequest, cache, options)
				console.log "r", r.length
				r
			catch e
				throw toRollupError(e, options)

	# def handleHotUpdate(context\HmrContext)
	# 	console.log "context", context
	# 	const normalizedFilename = normalize(context.file, options.root);
	# 	const old-js-file = cache.getJS({ssr: no, normalizedFilename})
	# 	const new-js-file = await context.read!

	# 	debugger	
	# 	if new-js-file == old-js-file.code
	# 		return context.modules.filter do $1.url.includes "type=style"

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

	plugins
		
