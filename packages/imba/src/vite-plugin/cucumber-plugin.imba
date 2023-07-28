import compiler from "gherking";
import { toRollupError } from "./utils/error";
import {
	preResolveOptions,
	resolveOptions,
} from "./utils/options";
import { createCompileImba } from "./utils/compile";
import Handlebars from "handlebars";
import rawTestTemplate from './cucumberTemplate.txt?raw'

Handlebars.registerHelper('isRuleOrScenario') do(a) a == 'Scenario' or a == 'Rule'
Handlebars.registerHelper('isScenarioOutline') do(a) a == 'Scenario Outline' or a == 'Scenario Template'
Handlebars.registerHelper('getDescriptionFromCells') do(cells)
	cells.map(do $1.value).join(', ')
Handlebars.registerHelper('getCellValue') do(header, index)
	header.cells[index].value
###
{{> scenario item=. parentId=../this.id }}
###
def indent(str, times = 1)
	let indentation = ""
	indentation += "\t" for i in [0 ... times]
	str
		.split('\n')
		.map(do "{indentation}{$1}")
		.join('\n')
const scenarioText = '''
s = global.Steps.find('{{{step.text}}}', '{{ step.keyword }}').stepDefinition
await s.target[s.fname]
	.apply(
		contexts.c{{ parentIndex }}.context,
		# variables
		[s.cucumberExpression.match('{{{step.text}}}').map(do $1.getValue!)]
	)
'''

Handlebars.registerPartial('step', "\n{indent(scenarioText, 2)}\n")
const L = console.log

const testTemplate = Handlebars.compile(rawTestTemplate)

export def generateImbaCode(id)
	let ast = await compiler.load(id)
	# ast = await compiler.process(ast)
	const doc = ast[0]
	const feature = doc.feature
	# L feature
	# debugger
	const stepDefsGlob = './step_definitions/**/*.imba'
	const backgroundEl = feature.elements.filter(do $1.keyword == 'Background')[0]
	const baseContextPath = './context.imba'

	def hasDecoractor(item, val)
		return yes if item.tags..find(do $1.name == val)
		for el in item.elements or []
			return hasDecoractor(el)
		no
	const code = testTemplate({
		feature
		backgroundEl
		stepDefsGlob
		baseContextPath
		hasNoTimeout: hasDecoractor(feature, 'notimeout')
	})

def _transform(id, compileImba, options)
	const code = await generateImbaCode(id)
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

export default def cucumberPlugin(inlineOptions = {})
	let options
	let compileImba\( (imbaRequest: ImbaRequest,code: string,options: Partial<ResolvedOptions>,) => Promise<CompileData>)

	
	def config(config, configEnv)
		options = await preResolveOptions(inlineOptions, config, configEnv)

	def configResolved(config)
		options = resolveOptions(options, config);
		# patchResolvedViteConfig(config, options);
		compileImba = createCompileImba(options);
		
	def transform(_, id)
		if id.endsWith('.feature')
			await _transform(id, compileImba, options)

	return 
		name: "vite-plugin-imba-cucumber"
		enforce: 'pre'
		config: config
		configResolved: configResolved
		transform: transform

				
