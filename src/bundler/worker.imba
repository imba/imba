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

workerpool.worker(compile: compile)