import np from 'path'
import fs from 'fs'

import Service from '../index'
import * as ts from 'typescript/lib/tsserverlibrary'

def run
	let s = new Service(np.resolve(__dirname,'extend'))
	await s.ready
	let x = global.ils
	let doc = s.file('main.imba')
	let ext = s.file('ext.imba')

	def p str, label = ''
		console.log label + ' --------------------------'
		console.log str

	def pfile str
		let f = s.file(str)
		p f.js, f.fileName + ' js'

		if f.dts
			p f.dts.#raw, f.fileName + ' dts'
			p f.dts.#body, f.fileName + ' dts'
			p f.dts.#mappings, ' mappings'
	
	def findPos file, pos
		if typeof pos == 'string'
			let off = pos.indexOf('~')
			let index = file.content.indexOf(pos.replace('~',''))
			pos = pos.replace(/\#\s.*/,'')
			pos = index + (off >= 0 ? off : Math.floor(pos.length * 0.5))
			# console.log 'foundpos?',pos,index
		return pos

	def findFile file
		if typeof file == 'string'
			file = s.file(file)
		return file


	def getdef file, pos
		let src = file.fileName or file
		pos = findPos(file,pos)
		console.log 'get definition',pos
		let res = x.ls.getDefinitionAndBoundSpan(src,pos)
		
		if res
			p res.textSpan
			p res.definitions

	def getinfo file, pos
		let src = file.fileName or file
		pos = findPos(file,pos)
		let res = x.ls.getQuickInfoAtPosition(src,pos)
		console.log 'get info for',src,pos
		p res

	def checker file
		file = findFile(file)
		return file.getTypeChecker!

	def completions file, pos, o = {triggerCharacter: ''}
		file = findFile(file)
		let src = file.fileName or file
		pos = findPos(file,pos)
		let ctx = file.doc.getContextAtOffset(pos)
		let res = x.ls.getQuickInfoAtPosition(src,pos)
		let completions = file.getCompletions(pos,o)
		let plain = completions.serialize!.map do $1.label..name or $1.label
		console.log 'ctx',src
		# ,ctx.before
		console.log plain

	def check doc, pos
		let ctx = doc.doc.getContextAtOffset(pos)
		let completions = doc.getCompletions(pos,{triggerCharacter: ''})
		console.log "at pos",pos,ctx.before.line
		let plain = completions.serialize!.map do $1.label..name or $1.label
		console.log plain

	if false
		getdef(doc,'<ap~p-button ')
		completions(doc,'data.extthis!.~')
		completions(doc,'data.extthis().~')
		completions('ns.imba','~# setup')
		completions(doc,"import '~'")
		completions(doc,"from './views/~")
		# getinfo(doc,'def ti~c')

	ils.getDiagnostics!.map do
		console.log $1.code,$1.messageText,$1.category,$1.file..fileName

	if false
		let dts = ils.dts.content
		let jsdts = dts.replace(/\extend\/(.*)$/g) do "extendjs/{$1.replace('.imba','.js')}"
		jsdts = jsdts.replace(/extend\//g,'extendjs/').replace(/\.imba/g,'.js')
		fs.writeFileSync('./extendjs/global.d.ts',jsdts)

	process.exit(0)

run!

