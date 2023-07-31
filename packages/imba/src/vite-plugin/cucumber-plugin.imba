import {parse} from "gherkin-io";
import { toRollupError } from "./utils/error";
import {
	preResolveOptions,
	resolveOptions,
} from "./utils/options";
import { createCompileImba } from "./utils/compile";
import Handlebars from "handlebars";
import rawTestTemplate from './cucumberTemplate.txt?raw'

Handlebars.registerHelper('decoratedSuite') do(keyword, item)
	if item.tags..find(do $1.name == 'only')
		"{keyword}.only"
	else
		keyword

Handlebars.registerHelper('isScenario') do(a) a == 'Scenario' or a == 'Example'
Handlebars.registerHelper('isScenarioOutline') do(a) a == 'Scenario Outline' or a == 'Scenario Template'
Handlebars.registerHelper('getOriginalValue') do(val)
	if isNaN(val)
		`'"{val}"'`
	else val 
Handlebars.registerHelper('getDescriptionFromCells') do(cells)
	cells.map(do $1.value).join(', ')
Handlebars.registerHelper('getCellValue') do(header, index)
	header.cells[index].value

def indent(str, times = 1)
	let indentation = ""
	indentation += "\t" for i in [0 ... times]
	str
		.split('\n')
		.map(do "{indentation}{$1}")
		.join('\n')

const scenarioText = '''
s = global.Steps.find(text, keyword).stepDefinition
stepRes = await s.target[s.fname]
	.apply(
		context,
		# variables
		[s.cucumberExpression.match(text).map(do $1.getValue!)]
	)
if stepRes..features
	L stepRes
'''

Handlebars.registerPartial('step', "\n{indent(scenarioText, 2)}\n")
Handlebars.registerPartial('step4', "\n{indent(scenarioText, 4)}\n")

const L = console.log

const testTemplate = Handlebars.compile(rawTestTemplate)

export def generateImbaCode(id, content)
	let doc = await parse(content, id)
	const feature = doc.feature
	const stepDefsGlob = './step_definitions/**/*.imba'
	const backgroundEl = feature.elements.filter(do $1.keyword == 'Background')[0]
	const baseContextPath = './context.imba'

	def hasDecoractor(item, val)
		val = [val] unless Array.isArray(val)

		return yes if item.tags..find(do val.indexOf($1.name) != -1)
		for el in item.elements or []
			return hasDecoractor(el)
		no
	const code = testTemplate({
		feature
		backgroundEl
		stepDefsGlob
		baseContextPath
		hasNoTimeout: hasDecoractor(feature, ['notimeout', 'debug'])
	})

def _transform(id, content, compileImba, options)
	const code = await generateImbaCode(id, content)
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

export def parseFeatureIntoSteps(feature, id = "dynamic.feature")
	const doc = await parse(feature, id)	
	const bgElements = doc.feature.elements
		.filter(do $1.keyword == 'Background')
		.flatMap do $1.steps

	doc.feature.elements.flatMap do(element)
		let k = element.keyword
		if k == 'Scenario'
			bgElements.concat element.steps
		elif k == 'Background' 
			[]
		elif k == 'Scenario Outline' or k == 'Scenario Template'
			element.examples.flatMap do(example)
				example.body.flatMap do({cells})
					bgElements.concat element.steps.map do(step)
						let text = step.text
						for {value}, i in cells
							const v = if isNaN(value) then `'"{value}"'` else value 
							text = text.replaceAll("<{example.header.cells[i].value}>", v)
						{text, keyword:step.keyword}

export default def cucumberPlugin(inlineOptions = {})
	let options
	let compileImba\( (imbaRequest: ImbaRequest,code: string,options: Partial<ResolvedOptions>,) => Promise<CompileData>)

	
	def config(config, configEnv)
		options = await preResolveOptions(inlineOptions, config, configEnv)

	def configResolved(config)
		options = resolveOptions(options, config);
		compileImba = createCompileImba(options);
		
	def transform(content, id)
		if id.endsWith('.feature')
			await _transform(id, content, compileImba, options)

	return 
		name: "vite-plugin-imba-cucumber"
		enforce: 'pre'
		config: config
		configResolved: configResolved
		transform: transform

				
