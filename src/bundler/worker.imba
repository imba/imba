import compiler from 'compiler'
import imba1 from 'compiler1'

const workerpool = require('workerpool')

const id = Math.random!

def compile_imba code, options
	let out = {id: options.sourceId}
	let res = compiler.compile(code,options)
	let js = res.js

	if res.css
		js += "\nimport 'styles:{options.sourcePath}'"

	# clean up the trims now
	out.js = js
	out.css = res.css
	return out


def compile_imba1 code,options
	let response = {id: options.sourceId}
	options.target = 'web' if options.target == 'browser'
	let res = imba1.compile(code,options)
	let js = res.js

	if js.indexOf('$_ =') > 0
		js = "var $_;\n{js}"

	return {id: options.sourceId, js: js}

workerpool.worker(
	compile_imba: compile_imba
	compile_imba1: compile_imba1
)