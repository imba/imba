import np from 'path'
import fs from 'fs'

import Service from '../index'
import * as ts from 'typescript/lib/tsserverlibrary'

def run
	let base = np.resolve(__dirname,'extend')
	let t0 = Date.now!
	let s = new Service(base)
	await s.ready
	console.log 'ready!'
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

	def completions file, pos, o = {}, filter = null
		o.triggerCharacter ??= ''
		file = findFile(file)
		let src = file.fileName or file
		pos = findPos(file,pos)
		let ctx = file.doc.getContextAtOffset(pos)
		# let res = x.ls.getQuickInfoAtPosition(src,pos)
		let completions = file.getCompletions(pos,o)
		completions.items = completions.filter(filter) if filter
		let plain = completions.serialize!.map do $1.label..name or $1.label
		console.log 'ctx',src
		console.log plain
		return completions

	def check doc, pos
		let ctx = doc.doc.getContextAtOffset(pos)
		let completions = doc.getCompletions(pos,{triggerCharacter: ''})
		console.log "at pos",pos,ctx.before.line
		let plain = completions.serialize!.map do $1.label..name or $1.label
		console.log plain

	def completion file, filter = null, pos = "~\n# eof", o = {}
		let res = completions(file, pos,{all: yes},filter)
		console.log 'res',res,res.items,pos,filter
		# debugger
		if res.items[0]
			res.items[0].resolve!
			console.log res.items[0].importData
			console.log res.serialize![0]
			return res.items[0]



	if false
		getdef(doc,'<ap~p-button ')
		completions(doc,'data.extthis!.~')
		completions(doc,'data.extthis().~')
		completions('ns.imba','~# setup')
		completions(doc,"import '~'")
		completions(doc,"from './views/~")
		# getinfo(doc,'def ti~c')

	
	

	# console.log s.file('accessors.imba').js
	# return
	# return process.exit(0)

	if false
		let dts = ils.dts.content
		let jsdts = dts.replace(/\extend\/(.*)$/g) do "extendjs/{$1.replace('.imba','.js')}"
		jsdts = jsdts.replace(/extend\//g,'extendjs/').replace(/\.imba/g,'.js')
		fs.writeFileSync('./extendjs/global.d.ts',jsdts)

	if true
		let Value = ts.SymbolFlags.Value
		let api = doc.checker.autoImports
		let res = api.search('PrimaryB',Value)
		let res2 = api.search do(name,flags)
			console.log name,flags,flags & Value
			return yes
		p res
		let resolved = api.resolve(res)
		p resolved
		console.log 8192 & Value

	if 1
		completion(doc,/PrimaryButt/)
		completion(doc,/PrimaryDef/)
		let but = completion(doc,/AppButt/)
		# console.log but.importInfo.importClauseOrBindingPattern.namedBindings.elements[0]
		completion(doc,/AppStar/)
	
	if 1
		completions(doc,"import './~'")
		p completions(doc,"let m14\\~",{},/AppSt/).serialize!
		

	if 0
		let res = completions(doc,"~\n# eof",{all: yes},/AppB/)
		console.log res.items[0]
		res.items[0].resolve!
		console.log res.items[0].exportInfo
		console.log res.serialize![0]

	let took = Date.now! - t0
	let errors = ils.getDiagnostics!
	errors.map do
		console.log $1.code,$1.messageText,$1.category,$1.file..fileName
	# console.log x.cp.rootFiles
	for f in x.cp.rootFiles
		console.log f.fileName
	console.log "found {errors.length} errors",took
	process.exit(0)

run!

