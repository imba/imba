import np from 'path'
import fs from 'fs'

import Service from '../index'
import * as ts from 'typescript/lib/tsserverlibrary'

def run
	let name = process.argv[2]
	let file = process.argv[3] or 'main.imba'
	let base = np.resolve(__dirname,name)
	let t0 = Date.now!
	let s = new Service(base,{})
	s.open(file)
	await s.ready
	console.log 'ready!'
	s.open(file)
	let ils = global.ils
	let took = Date.now! - t0
	let errors = global.ils.getDiagnostics!
	errors.map do
		console.log $1.code,$1.messageText,$1.category,$1.file..fileName
	for f in ils.cp.rootFiles
		console.log f.fileName
	console.log "found {errors.length} errors",took
	process.exit(0) unless process.env.WATCH

run!

