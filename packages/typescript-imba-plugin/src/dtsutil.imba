import {utils} from 'imba-monarch'

const CLASS = /export class (\Ω[^\s]+)\s\{(.+?)^\}/gms
const EXTENDS = /\s{4}__extends__: (\{.+?\n\s{4}\}|.+?)\;/s

def extractBlock name,text,imports = []
	let info = {
		name: name
		self: 'this'
	}

	let ext
	if ext = text.match(/^(?:import\((\".+?\")\)\.)?([^;]+)/)
		info.ns = ext[1]
		info.name = ext[2]

	if text.indexOf('{') == 0
		info.name = name
		info.global = yes
		info.self = "globalThis.{name}"

	if text == 'any'
		info.self = info.name = name

	return info

export def rewriteDts code
	let mappings = {}
	let imports = {}
	code.replace(/^import ([^\;]+)\;/gm) do(m,all)
		let [names,path] = all.split(' from ')
		for part in names.replace(/[\{\}\,]/g,' ').trim!.split(/\s+/)
			imports[part] = path
		return ''
	# return ""
	let old = code
	code = code.replace(CLASS) do(m,extname,body)
		let name = extname.split('Ω')[1]
		let lines = body.split('\n')
		let that = (body.match(EXTENDS) or [])
		let info = extractBlock(name,that[1])

		if utils.isTagIdentifier(name)
			let el = utils.tagNameToClassName(name)
			if el
				info.name = el.name

		# body = body.replaceAll(that,'this')
		body = body.replace(that[0],'')

		info.ns ||= imports[info.name]

		body = body.replaceAll('this: '+that[1],'')
		body = body.replaceAll('(,','')
		body = body.replaceAll(': ' + that[1] + ';',": {info.self};")

		# if name == 'ImmediateDefJS'
		#	body = body.replaceAll(': this;',': globalThis.ImmediateDefJS;')

		body = body.replace(/\@this \{.+?\}/gs,'')
		body = body.replace(/\/\*\*?[\r\n\t\s]*\*\//g,'')
		body = body.replace(/\/\*.+?\*\//gs,'')
		body = body.replaceAll(/this: this,?/g,'')
		let ns = info.ns ? "module {info.ns}" : "global"
		# body = body.replaceAll(/this: &THIS&\/,'')
		let out = "declare {ns} " + '{ interface ' + info.name + ' {' + body + '\n} }'
		return out
	code

