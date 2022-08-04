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
		return pos


	def getdef file, pos
		let src = file.fileName or file
		pos = findPos(file,pos)
		let res = x.ls.getDefinitionAndBoundSpan(src,pos)
		p res.textSpan
		p res.definitions

	def getinfo file, pos
		let src = file.fileName or file
		pos = findPos(file,pos)
		let res = x.ls.getQuickInfoAtPosition(src,pos)
		console.log 'get info for',src,pos
		p res

	def check doc, pos
		let ctx = doc.doc.getContextAtOffset(pos)
		let completions = doc.getCompletions(pos,{triggerCharacter: ''})
		console.log "at pos",pos,ctx.before.line
		console.log completions.serialize!

	# for pos in [57,88,115,151,196,220,233]
	# 	check(doc,pos)

	let dts = s.file('ext.imba').dts

	# s.file('ext.imba').editContent(0,0,' ')
	# s.file('ext.imba').compile!

	dts = s.file('ext.imba').dts

	fs.writeFileSync(np.resolve(__dirname,'ext.d.ts.2'),ext.dts.#raw)
	fs.writeFileSync(np.resolve(__dirname,'ext.processed.d.ts.2'),ext.dts.#body)
	# console.log doc.getCompletions(57,{triggerCharacter: ''}).serialize!
	# console.log doc.getCompletions(88,{triggerCharacter: ''}).serialize!
	# console.log doc.getCompletions(115,{triggerCharacter: ''}).serialize!
	# console.log doc.getCompletions(151,{triggerCharacter: ''}).serialize!
	pfile('def.imba')
	pfile('ext.imba')

	# s.file('autoglobal.imba').syncGeneratedDts!
	# pfile('autoglobal.imba')
	# return
	
	# getdef(doc,373)
	
	# p x.ls.getTypeDefinitionAtPosition(doc.fileName,373)
	getdef(doc,'app-button')
	# getdef(doc,'[SomeClass]')
	getdef(doc,'state # elstate')
	getdef(doc,'ImmediateDefJS')
	getdef(doc,'r.ext2')
	getinfo(ext,'extend tag ele~ment')
	getinfo(ext,'extend class Some~Cl')
	getinfo(ext,'Lo~cal # ')
	getdef(doc,'new Late~D')
	getdef(doc,'\<ap~p-button>')
	getdef(doc,'new Some~Class')

	# getdef(doc,387)
	# console.log doc.doc.getOutline!
	
	fs.writeFileSync(np.resolve(__dirname,'generated.d.ts_'),x.cp.#dts.content)
	

	# check(ext,487)
	debugger

run!

