import compiler from 'compiler'
import imba1 from 'compiler1'

const workerpool = require('workerpool')

const id = Math.random!

def compile {code,type,options}
	let response = {id: options.sourceId}

	if type == 'imba1'
		let res = imba1.compile(code,options)
		response.js = res.js

	elif type == 'imba'
		let res = compiler.compile(code,options)
		let js = res.js

		if res.css
			js += "\nimport 'styles:{options.sourcePath}'"

		response.js = js
		response.css = res.css
	return response


def compile_imba1 code,options
	let response = {id: options.sourceId}
	options.target = 'web' if options.target == 'browser'
	let res = imba1.compile(code,options)
	let js = res.js

	if js.indexOf('$_ =') > 0
		js = "var $_;\n{js}"

	return {id: options.sourceId, js: js}

workerpool.worker(
	compile: compile
	compile_imba1: compile_imba1
)