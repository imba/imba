import * as util from './util'
import {rewriteDts} from './dtsutil'

def extractBlock text,imports = []
	let info = {}
	let ext
	info.#full = text
	if ext = text.match(/typeof (?:import\("([^"]+)"\)\.)?([^;]+)/)
		info.ns = ext[1]
		info.name = ext[2]

		let source = imports.find do $1[0].match(ext[2])
		if source
			info.ns ||= source[1]
	# elif ext = text.match(/typeof ([\w]+)/)	
	if text.indexOf(' {') == 0
		info.global = yes

	return info


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

	get content
		#body
	
	def update body
		let prev = #raw
		#raw = body
		unless body
			clear! if prev
			return

		if prev == body
			return

		body = rewriteDts(body)
	
		# TODO What if the new version is now empty? We want to remove it now
		if #body =? body
			return self unless owner

			let proj = owner.project
			util.log 'updating dts',fileName,body

			let file = self.script = ils.setVirtualFile(fileName,body)

			if file
				if !proj.isRoot(file)
					proj.addRoot(file)
				proj.markAsDirty!
				proj.updateGraph!
			self