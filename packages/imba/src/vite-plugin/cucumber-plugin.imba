import compiler, {Step} from "gherking";
import { toRollupError } from "./utils/error";
import {
	buildExtraViteConfig,
	patchResolvedViteConfig,
	preResolveOptions,
	resolveOptions,
	validateInlineOptions
} from "./utils/options";
import { createCompileImba } from "./utils/compile";
import Handlebars from "handlebars";
import rawTestTemplate from './cucumberTemplate.txt'

Handlebars.registerHelper('isRuleOrScenario') do(a) a == 'Scenario' or a == 'Rule'
const L = console.log

let testTemplate
export default def cucumberPlugin(inlineOptions = {})
	let options\ResolvedOptions
	let test?\boolean
	let build?\boolean
	let dev?\boolean
	let compileImba\( (imbaRequest: ImbaRequest,code: string,options: Partial<ResolvedOptions>,) => Promise<CompileData>)
	let viteConfig
	let requestParser

	testTemplate = Handlebars.compile(rawTestTemplate)
	def config(config, configEnv)
		options = await preResolveOptions(inlineOptions, config, configEnv)

		test? = configEnv.mode === "test"
		build? = configEnv.mode === "production"
		dev? = configEnv.mode === "development"
		
		options

	def configResolved(config)
		options = resolveOptions(options, config);
		# patchResolvedViteConfig(config, options);
		compileImba = createCompileImba(options);
		viteConfig = config;
		
	def transform(source, id, opts)
		if id.endsWith('.feature')
			let ast = await compiler.load(id)
			# ast = await compiler.process(ast)
			let res = ''
			const doc = ast[0]
			const feature = doc.feature
			const stepDefsGlob = './step_definitions/**/*.imba'
			const backgroundEl = feature.elements.filter(do $1.keyword == 'Background')[0]

			const code = testTemplate({feature, backgroundEl, stepDefsGlob})
			let compiledData
			const imbaRequest = {
				id: id
				filename: id
				normalizedFilename: id
				query: {}
			}
			try compiledData = await compileImba(imbaRequest, code, options) catch e
				throw toRollupError(e, options);
			return compiledData.compiled.js

	return 
		name: "vite-plugin-imba-cucumber"
		enforce: 'pre'
		config: config
		configResolved: configResolved
		transform: transform

				
