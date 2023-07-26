import compiler, {Step} from "gherking";
import { toRollupError } from "./utils/error";

import np from 'node:path'
import {
	buildExtraViteConfig,
	patchResolvedViteConfig,
	preResolveOptions,
	resolveOptions,
	validateInlineOptions
} from "./utils/options";
import { createCompileImba } from "./utils/compile";

const L = console.log

export default def cucumberPlugin(inlineOptions = {})
	let options\ResolvedOptions
	let test?\boolean
	let build?\boolean
	let dev?\boolean
	let compileImba\( (imbaRequest: ImbaRequest,code: string,options: Partial<ResolvedOptions>,) => Promise<CompileData>)
	let viteConfig
	let requestParser

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
			# debugger
			# ast = await compiler.process(ast)
			let res = ''
			const doc = ast[0]
			const feature = doc.feature
			const stepDefsGlob = './step_definitions/**/*.imba'
			const backgroundEl = feature.elements.filter(do $1.keyword == 'Background')[0]

			let code = `

const modules = import.meta.glob('{stepDefsGlob}', \{eager: yes})
let s
let c
let contexts = \{}
beforeEach do(suite)
	{feature.elements.map(do $1._id).map(do 'contexts.c'+ $1 + ' = global.__ccContext()').join('\n\t')}`
			for feat in feature.elements
				code += `
	contexts.c{feat._id} =
		context: global.__ccContext()
		name: '{feat.keyword}: {feat.name}'
`
			if backgroundEl
				for step\Step in backgroundEl.steps
					const {keyword, text} = step
					code += `
	s = global.Steps.find('{text}', '{keyword}').stepDefinition
	c = Object.keys(contexts).find(do contexts[$1].name == suite.meta.name)
	await s.target[s.fname].apply(contexts[c].context, [s.cucumberExpression.match('{text}').map(do $1.getValue!)])
`
			code += `
describe "Feature: {feature.name}" do\n`


			for el in feature.elements
				if el.keyword == 'Scenario' or el.keyword == 'Rule'
					# create a context
					const context = "contexts.c{el._id}.context"
					code += `
	test('{el.keyword}: {el.name}') do\n`
					for step\Step in el.steps
						const {keyword, text} = step
						code += `
		s = global.Steps.find('{text}', '{keyword}').stepDefinition
		await s.target[s.fname].apply({context}, [s.cucumberExpression.match('{text}').map(do $1.getValue!)])
`

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

				
