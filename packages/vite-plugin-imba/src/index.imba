import type { CompileData } from './utils/compile.ts'
import svgPlugin from "./svg-plugin";
import type { Plugin } from "vite";
import { buildIdParser, IdParser, ImbaRequest } from "./utils/id";
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

export def imba(inlineOptions\Partial<Options> = {})
	let name = "vite-plugin-imba"
	let enforce = "pre"
	let requestParser\IdParser;
	let compileImba\( (imbaRequest: ImbaRequest,code: string,_options: Partial<ResolvedOptions>,) => Promise<CompileData>)
	let _options\ResolvedOptions
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
		_options = await preResolveOptions(inlineOptions, config, configEnv)
		const extraViteConfig = buildExtraViteConfig(_options, config);
		log.debug("additional vite config", extraViteConfig);
		extraViteConfig;
	def configResolved(config)
		_options = resolveOptions(_options, config);
		# patchResolvedViteConfig(config, _options);
		requestParser = buildIdParser(_options);
		compileImba = createCompileImba(_options);
		viteConfig = config;
		# // TODO deep clone to avoid mutability from outside?
		api.options = _options;
		log.debug("resolved _options", _options);
	def transform(code, id, opts)
		const ssr = !!opts..ssr;
		const imbaRequest = requestParser(id, ssr);

		return if !imbaRequest or imbaRequest.query.imba

		let compiledData\CompileData
		try compiledData = await compileImba(imbaRequest, code, _options) catch e
			cache.setError(imbaRequest, e);
			throw toRollupError(e, _options);
		logCompilerWarnings
			imbaRequest,
			compiledData.compiled.warnings,
			_options,
		cache.update(compiledData)
		if compiledData.dependencies.length and _options.server
			compiledData.dependencies.forEach do(d)
				ensureWatchedFile _options.server.watcher, d, _options.root

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
		_options.server = server
		server.middlewares.use do(req, res, next)
			if req.url.endsWith ".imba"
				req.url += "?import"
				res.setHeader "Content-Type", "application/javascript"
			next()
		setupWatchers _options, cache, requestParser


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

	plugins
		
