import { ExpressionFactory, ParameterTypeRegistry } from '@cucumber/cucumber-expressions';
import { vi } from "vitest"

const expressionFactory = new ExpressionFactory(new ParameterTypeRegistry())

def __ccContext(klass, meta)
	const base = klass ? new klass : new Object
	base.meta = meta
	new Proxy(base,{
		get: do(target, prop)
			if target[prop] == undefined
				global[prop]
			else
				target[prop]
		set: do(target, prop, value)
			target[prop] = value
			true
	})

class __Step
	steps = []
	def add(expression, fname, target)
		const cucumberExpression = expressionFactory.createExpression(expression)
		steps.push { expression, fname, target, cucumberExpression }

	def findStepDefinitionMatches(step)
		steps.reduce(&, []) do(accumulator, stepDefinition)
			const matches = stepDefinition.cucumberExpression.match(step)
			return accumulator unless matches
			
			return accumulator.concat
				stepDefinition: stepDefinition
				parameters: matches.map do(match) match.getValue()
				
	def find(step, keyword = 'When')
		const stepDefinitionMatches = findStepDefinitionMatches(step)
		if !stepDefinitionMatches or stepDefinitionMatches.length == 0
			throw new Error("""
	Undefined.  Implement with the following snippet (Check case):
		@{keyword.toLowerCase!}('{step}')
		def step(params,data)
			# Write code here that turns the phrase above into concrete actions
			throw new Error('Not yet implemented!')

	""")
		if stepDefinitionMatches.length > 1
			throw new Error("More than one step which matches: \'" + step.type.name + " " + step.text + "\'")
		return stepDefinitionMatches[0]

let Steps = new __Step

vi.stubGlobal '__ccContext', __ccContext
vi.stubGlobal 'Steps', Steps