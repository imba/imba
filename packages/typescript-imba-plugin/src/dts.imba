import * as util from './util'

export default class ImbaScriptDts
	
	def constructor owner
		self.owner = owner

	get ils
		global.ils
		
	get ps
		ils.ps
		
	get ts
		global.ts
		
	get fileName
		owner.fileName + "._.d.ts"

	def clear
		yes
	
	def update body
		let prev = #raw
		#raw = body
		unless body
			clear! if prev
			return

		if prev == body
			return

		let imports = []
		body.replace(/^import [^\;]+\;/gm) do(m)
			let str = m.replace(/[\r\n]/g,'')
			let path = str.split('"')[1]
			imports.push([str.split('from')[0],path])
			''

		let idx = 0
		while (idx = body.indexOf('class Extend$',idx)) >= 0
			# add double closer
			body = body.slice(0,idx) + body.slice(idx).replace('\n}','\n}}')
			idx += 5
			
		# find imports
		body = body.replace(/export class Extend\$(\w+)\$\w+(?:\$(\w+))?\s(extends (\w+)\s)?\{/g) do(m,name,mod)
			# console.log 'replacing',m,mod,name
			# if mod == 'import'
			let reg = new RegExp(" {name}[, ]")
			let source = imports.find do $1[0].match(reg)
			# console.log 'found source?',source,reg
			if source
				return "declare module \"{source[1]}\" \{\ninterface {name} \{"
			# let path = body.replace()
			
			'declare global {\ninterface ' + name + ' {'
			
		# can we do this?
		
		# now replace the this types
		body = body.replace(/Extend\$(\w+)\$\w+/g,'this')
		body = body.replace(/\@this \{ this & \w+ \}/g,'')
		body = body.replace(/this & \w+/g,'this')
		
		# clean empty comments
		body = body.replace(/\/\*\*?[\r\n\t\s]*\*\//g,'')
		
		# clean all jsdoc related comments since they should
		# just be proxied to the real imba file
		body = body.replace(/\/\*\*[\S\s]+?\*\//gm, '')
		
		# replace extends field
		body = body.replace(/^[\t\s]+__extends__\:.+;/gm,'')
		
		body = body + '\nexport {}'
	
		# TODO What if the new version is now empty? We want to remove it now
		if #body =? body
			return self unless owner

			let proj = owner.project
			util.log 'updating dts',owner.fileName,body

			let file = self.script = ils.setVirtualFile(fileName,body)

			if file
				if !proj.isRoot(file)
					proj.addRoot(file)
				proj.markAsDirty!
				proj.updateGraph!
			self