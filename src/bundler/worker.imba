###
Script for compiling imba and imba1 files inside workers using
workerpool. 
###

import compiler from 'dist/node/compiler.js'
import imba1 from 'dist/../scripts/bootstrap.compiler.js'

const workerpool = require('workerpool')

const id = Math.random!

def compile_imba code, options
	let out = {id: options.sourceId}
	let res = null
	
	try
		res = compiler.compile(code,options)
	catch e
		console.log "ERROR COMPILING IMBA",e,options.sourcePath
		res = {}

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