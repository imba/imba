###
Script for compiling imba files inside workers using workerpool.
###

import {compile} from 'dist/compiler.cjs'

const workerpool = require('workerpool')

const id = Math.random!

def compile_imba code, options
	let out = {id: options.sourceId}
	let res = null

	try
		res = compile(code,options)
	catch e
		console.log "ERROR COMPILING IMBA",e,options.sourcePath,code
		res = {}

	if res.diagnostics
		for item in res.diagnostics
			item.lineText = item.#lineText

	if res.warnings
		out.warnings = res.warnings

	if res.errors
		out.errors = res.errors

	let js = res.js

	# clean up the trims now
	out.js = js
	out.css = res.css
	return out

workerpool.worker(
	compile_imba: compile_imba
)
