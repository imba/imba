
/*body*/

import svgPlugin from "./svg-plugin";;
;
import {transformWithEsbuild} from 'vite';
import {buildIdParser,normalize,injectQuery} from "./utils/id";;
;
import {log,logCompilerWarnings} from "./utils/log";;
import {createCompileImba} from "./utils/compile";;
;
import {buildExtraViteConfig,patchResolvedViteConfig,preResolveOptions,resolveOptions,validateInlineOptions} from "./utils/options";;

import {toRollupError} from "./utils/error";;
;
import {resolveViaPackageJsonImba} from "./utils/resolve";;
import {ensureWatchedFile,setupWatchers} from "./utils/watch";;
import {handleImbaHotUpdate} from './handle-imba-hot-update';;
import url from 'url';

const allCssModuleId = 'virtual:imba/*?css';
const resolvedAllCssModuleId = ("\0" + allCssModuleId);

/**
@param {Partial<Options>} inlineOptions
*/
export default function imbaPlugin(inlineOptions = {}){
	
	let name = "vite-plugin-imba";
	let enforce = "pre";
	let requestParser;
	let compileImba;
	let options;
	let viteConfig;
	let api = {};
	let resolvedImbaSSR;
	let testΦ;
	let buildΦ;
	let devΦ;
	
	validateInlineOptions(inlineOptions);
	const cache = new VitePluginImbaCache();;
	
	const plugins = [];
	async function config(config,configEnv){
		
		if (process.env.DEBUG) {
			
			log.setLevel("debug");
		} else if (config.logLevel) {
			
			log.setLevel(config.logLevel);
		};
		options = await preResolveOptions(inlineOptions,config,configEnv);
		const extraViteConfig = buildExtraViteConfig(options,config);;
		log.debug("additional vite config",extraViteConfig);;
		testΦ = configEnv.mode === "test";
		buildΦ = configEnv.mode === "production";
		devΦ = configEnv.mode === "development";
		return extraViteConfig;;
	};
	function configResolved(config){
		
		options = resolveOptions(options,config);;
		// patchResolvedViteConfig(config, options);
		requestParser = buildIdParser(options);;
		compileImba = createCompileImba(options);;
		viteConfig = config;;
		// // TODO deep clone to avoid mutability from outside?
		api.options = options;;
		return log.debug("resolved options",options);;
	};
	async function transform(code,id,opts){
		
		const ssr = !(!opts?.ssr);;
		const imbaRequest = requestParser(id,ssr);;
		
		if (!imbaRequest || imbaRequest.query.imba) { return };
		
		let compiledData;
		try {
			compiledData = await compileImba(imbaRequest,code,options);
		} catch (e) {
			
			cache.setError(imbaRequest,e);;
			throw toRollupError(e,options);;
		};
		logCompilerWarnings(
			imbaRequest,
			compiledData.compiled.warnings,
			options
		);
		cache.update(compiledData);
		if (compiledData.dependencies.length && options.server) {
			
			compiledData.dependencies.forEach(function(d) {
				
				return ensureWatchedFile(options.server.watcher,d,options.root);
			});
		};
		
		log.debug(("transform returns compiled js for " + (imbaRequest.filename)));
		if (imbaRequest.query.iife) {
			
			compiledData.compiled.js = await transformWithEsbuild(compiledData.compiled.js.code,imbaRequest.normalizedFilename.replace(".imba",".js"),{format: "iife"});
			compiledData.compiled.js.code = ("const body = " + JSON.stringify(compiledData.compiled.js.code) + "; export default \{body: body\}; export \{body\}");
		};
		
		return {
			...compiledData.compiled.js,
			meta: {
				vite: {
					lang: compiledData.lang
				}
			}
		};
	};
	
	function resolveId(id,importer,opts){
		
		let ssr = !(!opts?.ssr) || options.ssr;
		if (testΦ) { ssr = false };
		const imbaRequest = requestParser(id,ssr);
		if (id == allCssModuleId || id == "*?css" || id == "*") { return resolvedAllCssModuleId };
		if (imbaRequest?.query.imba) {
			
			if (imbaRequest.query.type === "style") {
				
				log.debug(("resolveId resolved virtual css module " + (imbaRequest.cssId)));
				return imbaRequest.cssId;
			};
			log.debug(("resolveId resolved " + id));
			return id;
		};
		if (ssr && id === "imba") {
			
			if (!resolvedImbaSSR) {
				
				resolvedImbaSSR = this.resolve("imba/server",undefined,{skipSelf: true}).then(function(imbaSSR) {
					
					log.debug("resolved imba to imba/server");
					return imbaSSR;
				});
			};
			return resolvedImbaSSR;
		};
		try {
			
			const resolved = resolveViaPackageJsonImba(id,importer,cache);
			if (resolved) {
				
				log.debug(("resolveId resolved $" + resolved + " via package.json imba field of " + id));
				return resolved;
			};
		} catch (e) {
			
			return log.debug.once(("error trying to resolve " + id + " from " + importer + " via package.json imba field "),e);
		};
	};
	
	function load(id,opts){
		
		const ssr = !(!opts?.ssr);
		const imbaRequest = requestParser(id,!!ssr);
		if (resolvedAllCssModuleId == id) {
			
			// if dev?
			return 'export default ".dev-ssr/all.css"';
		};
		if (imbaRequest) {
			
			const {filename: filename,query: query} = imbaRequest;
			if (query.imba && query.type === "style") {
				
				const _css = cache.getCSS(imbaRequest);
				if (_css) {
					
					log.debug(("load returns css for " + filename));
					return _css;
				} else {
					
					console.log(("cache empty: loading " + id));
				};
			};
			
			
			if (viteConfig.assetsInclude(filename)) {
				
				log.debug(("load returns raw content for " + filename));
				return fs.readFileSync(filename,"utf-8");
			};
		};
	};
	function configureServer(server){
		
		options.server = server;
		// Breaks tests, do not use until Vite has a proper fix
		// server.middlewares.use do(req, res, next)
		// 	const pathname = url.parse(req.url).pathname;
		// 	if pathname.endsWith ".imba"
		// 		req.url += "?import"
		// 		res.setHeader "Content-Type", "application/javascript"
		// 	next()
		// server.middlewares.use do(req, res, next)
		// 	const pathname = url.parse(req.url).pathname
		// 	if pathname.endsWith ".imba"
		// 		req.url = injectQuery req.url, 'import'
		// 		res.setHeader('Content-Type', 'application/javascript')
		// 	next!
		return setupWatchers(options,cache,requestParser);
	};
	/**
	@param {HmrContext} ctx
	*/
	async function handleHotUpdate(ctx){
		
		if (!options.hot || !options.emitCss) {
			
			return;
		};
		const imbaRequest = requestParser(ctx.file,false,ctx.timestamp);
		if (imbaRequest) {
			
			try {
				
				return await handleImbaHotUpdate(compileImba,ctx,imbaRequest,cache,options);
			} catch (e) {
				
				throw toRollupError(e,options);
			};
		};
	};
	
	// def handleHotUpdate(context\HmrContext)
	// 	console.log "context", context
	// 	const normalizedFilename = normalize(context.file, options.root);
	// 	const old-js-file = cache.getJS({ssr: no, normalizedFilename})
	// 	const new-js-file = await context.read!
	
	// 	debugger	
	// 	if new-js-file == old-js-file.code
	// 		return context.modules.filter do $1.url.includes "type=style"
	
	plugins.push(svgPlugin());
	plugins.push(
		{name: "vite-plugin-imba",
		enforce: "pre",
		api: api,
		config: config,
		configResolved: configResolved,
		transform: transform,
		load: load,
		resolveId: resolveId,
		configureServer: configureServer,
		handleHotUpdate: handleHotUpdate}
	);
	// plugins.push iifePlugin!
	
	return plugins;
	
};
