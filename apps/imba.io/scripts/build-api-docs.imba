import np from 'path'
import nfs from 'fs'

import * as ts from 'typescript/lib/tsserverlibrary'
import imba-plugin from 'typescript-imba-plugin'
import {SymbolFlags,ModifierFlags,CategoryFlags} from '../src/util/flags'

import { marked } from 'marked'
import mdn-api from './mdn-data/api/inheritance.json'

const mdrenderer = new marked.Renderer

export const Globals = {
	'global': {datatype: 'globalThis'}
	'imba': {datatype: 'globalThis.imba'}
	'module': {}
	'window': {datatype: 'globalThis.window'}
	'document': {datatype: 'globalThis.document'}
	'exports': {}
	'console': {datatype: 'globalThis.console'}
	'process': {datatype: 'globalThis.process'}
	'parseInt': {datatype: 'globalThis.parseInt'}
	'parseFloat': {datatype: 'globalThis.parseFloat'}
	'setTimeout':{datatype: 'globalThis.setTimeout'}
	'setInterval': {datatype: 'globalThis.setInterval'}
	'setImmediate': {datatype: 'globalThis.setImmediate'}
	'clearTimeout': {datatype: 'globalThis.clearTimeout'}
	'clearInterval': {datatype: 'globalThis.clearInterval'}
	'clearImmediate': {datatype: 'globalThis.clearImmediate'}
	'globalThis': {datatype: 'globalThis'}
	'isNaN': {datatype: 'globalThis.isNaN'}
	'isFinite': {datatype: 'globalThis.isFinite'}
	'__dirname': {datatype: '\\string'}
	'__filename': {datatype: '\\string'}
	'__realname': {datatype: '\\string'}
}

let codeblocknr = 0
let mdstate = {}

def mdrenderer.code code, lang, opts = {}
	
	let escaped = code.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
	let nr = ++codeblocknr
	return String(new <app-code-block data-path="/docs"> <code data-name="{nr}.imba" data-lang=lang> escaped)

def mdrenderer.codespan code
	let m
	let o = {}
	
	if m = code.match(/^(\@\w+)$/)
		o.kind = 'event'
	elif m = code.match(/^(\@\w+)\.([\w\-]+)$/)
		o.kind = 'eventmodifier'
		
	if o.kind
		return String(new <api-link name=code> code)

	let escaped = code.replace(/\</g,'&lt;').replace(/\>/g,'&gt;')
	return String(new <code> escaped)

def mdrenderer.heading text, level
	mdstate[text] = yes
	return "<h{level}>{text}</h{level}>"
	
def toMarkdown str, meta
	mdstate = meta or {}
	marked.parse(str,{
		renderer: mdrenderer
		sanitize: false
	})


###
export interface Logger {
        close(): void;
        hasLevel(level: LogLevel): boolean;
        loggingEnabled(): boolean;
        perftrc(s: string): void;
        info(s: string): void;
        startGroup(): void;
        endGroup(): void;
        msg(s: string, type?: Msg): void;
        getLogFileName(): string | undefined;
    }
###
class Logger
	def close
		yes
		
	def hasLevel lebel
		yes
		
	def loggingEnabled
		yes
		
	def perftrc
		yes
		
	def info str
		console.log str
	
	def startGroup
		console.group()
	
	def endGroup
		console.groupEnd()
		
	def msg str, type = null
		console.log str
	
	def getLogFileName
		undefined

let old = ts.sys.require
ts.sys.require = do(initialPath\string, moduleName\string)

	if moduleName == 'typescript-imba-plugin'
		return {module: imba-plugin}
	
	old.apply(ts.sys,arguments)

# use the local imba version?
global.IMBA_TYPINGS = np.resolve(__dirname,'..','node_modules','typescript-imba-plugin','typings','imba.d.ts')

let options = {
	host: ts.sys
	logger: new Logger
	globalPlugins: ['typescript-imba-plugin']
	LanguageServiceMode: ts.LanguageServiceMode.Semantic
}

console.log options.pluginProbeLocations

let project = new ts.server.ProjectService(options)
let root = np.resolve(__dirname)
let abs = do(...parts) np.resolve(__dirname,'docs',...parts)
	
console.log root
# process.exit(0)
project.openClientFile(abs('project.imba'))
console.log !!global.ils

# now go through and generate stuff?
let script = global.ils.getImbaScript('project.imba')
let checker = script.getTypeChecker!



def getFileName node
	return '' unless node
	if node.fileName
		return node.fileName
	if node.parent
		return getFileName(node.parent)
		
def write name, data
	# let dest = np.resolve(__dirname,'..','..','imba.io','public',name + '.json')
	let tpl = 'globalThis.$api$ = function(_){\nCONTENT\n}'

	let dest = np.resolve(__dirname,'..','public',name + '.json')
	let body = JSON.stringify(data,null,2)
	nfs.writeFileSync(dest,body,'utf8')

def getDocs item,meta
	let raw = item.getDocumentationComment(checker.checker)
	let md = ''

	for val in raw
		if val.text.includes('silent')
			console.log "FOUND docs?!?!",raw

	let docs = raw.map do(item)
		let text = item.text
		md += item.text
		return item
	
	# remove mdn reference for css props
	md = md.replace(/\[MDN Reference\].*\)/,'').trim!

	if md == ''
		return ''
	
	if md.includes('silent')
		console.log 'to markdown',md
	return toMarkdown(md,meta)


def getMeta sym
	let tags = sym.imbaTags

	if let doc = getDocs(sym)
		tags.desc = doc
	let fname = getFileName(sym.valueDeclaration)

	if fname.match(/typings/)
		tags.imba = yes
	
	if fname.match(/\bdom\./)
		tags.dom = yes

	return tags
	
let globalSym = checker.resolve('globalThis')
let globalEventTarget = checker.resolve('EventTarget')

let cssns = checker.checker.getMergedSymbol(checker.resolve('imbacss'))

cssns.#imbaName = 'css'

let counter = 0
const allEntries = []

def log sym
	for own k,v of sym
		console.log k,v

const extras = {
	"CSSStyleDeclaration": {shallow: yes}
	DocumentAndElementEventHandlers: {shallow: yes}
	GlobalEventHandlers: {shallow: yes}
	Animatable: {flatten: yes, skip: yes}
	InnerHtml: {flatten: yes, skip: yes}
	ChildNode: {flatten: yes, skip: yes}
	ParentNode: {flatten: yes, skip: yes}
	WindowOrWorkerGlobalScope: {flatten: yes, skip: yes}
}

class Entry

	static def for symbol\(ts.Symbol)
		symbol = checker.checker.getMergedSymbol(symbol)

		if symbol.#entry
			return symbol.#entry

		if symbol.flags & ts.SymbolFlags.Transient
			let other = checker.type(symbol).symbol
			# console.warn "TRANSIENT {symbol.imbaName}"

		symbol.#entry ||= new self(symbol)

	static def member symbol\(ts.Symbol),par
		let item = self.for(symbol)
		item.up = par if par
		return item

	parent = null
	name
	kind = null
	inherits = null
	implements = null
	flags = 0
	mods = 0
	cat = 0
	tags
	meta = {}
	docs

	constructor symbol
		symbol.#entry = self
		#symbol = symbol
		#key = Symbol!
		#extras = new Map
		setup!
	
	get css?
		cat & CategoryFlags.CSS

	def setup
		let sym = #symbol
		let typ = checker.type(sym,yes)
		# console.log "setup {sym.imbaName}",!!sym.parent,sym.parent..imbaName,sym.mergeId
		# typid = typ and typ.#typid ||= counter++
		flags = sym.flags
		flags ~= ts.SymbolFlags.Transient
		name = sym.imbaName
		meta = getMeta(sym)

		let extra = extras[name] or {}

		if meta.deprecated or name == 'TObject'
			return

		if name.match(/^__(new|call|index|constructor)/)
			return
		
		parent = sym == globalSym ? null : Entry.for(sym.parent or globalSym)

		if extra.skip
			return

		if name.match(/^\w+__$/) or name == 'internal'
			return

		if flags & SymbolFlags.TypeParameter
			return

		
		let d = getDocs(typ and typ.symbol or sym,meta)


		mods = sym.valueDeclaration..modifierFlagsCache
		mods ||= 0
		mods ~= ts.ModifierFlags.HasComputedFlags

		if checker.member(typ,'DOCUMENT_NODE')
			mods |= ModifierFlags.NodeInterface

		if parent and parent.#symbol == cssns
			# console.warn "is in css namespace",name
			# mods |= ModifierFlags.CSS
			if sym.isStyleProp
				cat |= CategoryFlags.CSSProperty
				flags = SymbolFlags.Property
				if meta.proxy
					proxy = Entry.for(checker.styleprop(meta.proxy))
					proxy.meta.aliases ||= []
					proxy.meta.aliases.push(name)
					mods |= ModifierFlags.ImbaSpecific
					delete meta.proxy
					return null
				

				if name.match(/(^ease)|(^e[atocb]?[dfw]?$)/)
					cat |= CategoryFlags.CSSEasing
					mods |= ModifierFlags.ImbaSpecific

				if name.match(/^(x|y|z|scale|scale-x|scale-y|skew-x|skew-y|rotate)$/)
					cat |= CategoryFlags.CSSTransform
					mods |= ModifierFlags.ImbaSpecific
				

			if sym.isStyleModifier
				cat |= CategoryFlags.CSSModifier
				flags = SymbolFlags.Modifier

			if sym.isStyleType
				cat |= CategoryFlags.CSSValueType
				flags = SymbolFlags.Enum
				name = name.slice(1)
		
		if parent and parent.css?
			cat |= CategoryFlags.CSSValue
			if flags & SymbolFlags.Property
				flags = SymbolFlags.EnumMember
				

		# hack around certain addEventListener things
		if parent..mods & ModifierFlags.NodeInterface and name.match(/^(add|remove)EventListener/)
			return

		# if mods
		#	console.log 'checkFlags',name,mods,mods & ts.ModifierFlags.Readonly
		if meta.custom or (meta.imba and sym.#kind != 'event' and (cat & CategoryFlags.CSS) == 0)
			mods |= ModifierFlags.ImbaSpecific

			delete meta.custom
			delete meta.imba

		if meta.experimental
			mods |= ModifierFlags.Experimental

		if meta.abstract
			mods |= ModifierFlags.Abstract

		let iface = flags & (32 | 64)

		let base = iface and typ ? checker.checker.getBaseTypes(typ) : []

		let mdn = mdn-api[name]

		if base[0]
			unless name == 'Navigator'
				inherits = Entry.for(base.shift!.symbol)

			# go through the items to we implement
			implements = for item in base
				let iname = item.symbol.name
				# let mdn = mdn-api[iname]

				if mdn and mdn.implements.indexOf(iname) == -1 or extras[iname]..flatten or name == 'Navigator'
					# console.log "{name} does not implement {iname} in mdn?? {!!mdn}",item.symbol.members.size
					for [mname,member] of (item.symbol.members or [])
						let sym = Object.create(member)
						sym.parent = #symbol
						sym.#entry = null
						# console.log "sym!!",sym,sym.getDocumentationComment
						if sym.getDocumentationComment
							#extras.set(sym.escapedName,sym)
						else
							console.log 'weird symbol??',sym
						# sym.escapedName,sym
					continue

				Entry.for(item.symbol)

		if checker.member(typ,'stopImmediatePropagation') or name == 'ImbaTouch'
			# kind = 'eventinterface'
			mods |= ModifierFlags.EventInterface

		
		if name[0] == '@' and !css?
			# only when defined on events?
			# console.log parent.name
			if parent.name.indexOf('Event') >= 0
				kind = 'modifier'
				flags = SymbolFlags.Modifier # should use category flags for these instead
			else
				kind = 'decorator'
				cat |= CategoryFlags.Decorator
				flags ~= SymbolFlags.Function
				

		if sym.#kind == 'event'
			kind = 'event'
			flags = SymbolFlags.Event

		if name.match(/^[A-Z_]+$/)
			mods |= ModifierFlags.Upcase

		id = allEntries.push(self)

		if typ and typ.symbol and typ.symbol != sym
			# interface or something?
			if typ.symbol.flags & (32 | 64)
				valuetype = Entry.for(typ.symbol)

		if sym == globalSym
			return self

		if extra.shallow
			return self

		# not for the namespaces?
		let props = checker.props(checker.member(sym,'prototype'))
		let added = {}
		for set in [sym.members,sym.exports,#extras]

			for [mname,member] of (set or [])

				# console.log mname
				continue if mname == 'prototype'

				if added[mname]
					# console.log "was already added {name} {mname}"
					continue

				added[mname] = yes
			
				let imbalib? = !!getFileName(member.valueDeclaration).match(/typings/)
				let meta = getMeta(member)

				if meta.desc or meta.summary or Object.keys(meta).length > 1 or !imbalib? or member.#kind
					Entry.for(member)

		return self

	def stringify data,ctx = [],root = no

		if data isa Entry and !data.id
			return null

		if data isa Entry and !root
			if ctx[data.#key] =? yes
				ctx.push( stringify(data,ctx,yes) )
			
			return "s[{data.id}]"
			
		if data isa Array
			return "[{data.map(do stringify($1,ctx)).join(',')}]"

		if typeof data == 'object'
			let o = []
			for own k,v of data
				continue if v isa Array and v.length == 0

				if k == 'meta' and v..click
					console.log 'output meta!',v,data

				unless v == null
					o.push "{k}:{stringify(v,ctx)}"

			let raw = "\{{o.join(',')}\}"

			return data isa Entry ? "s[{data.id}]=a({raw})" : raw
		
		if typeof data == 'string'
			return JSON.stringify(data)
		
		return data

let globalEntry = Entry.for(globalSym)

def serialize entries = allEntries
	let out = 'globalThis.$api = function(s,a){\n return ['

	let ctx = []

	for item in entries
		item.stringify(item,ctx)

	out += ctx.join(',\n') + ']}'
	# console.log out
	return out


def run
	let arr = checker.sym('Array')
	let sch = checker.sym('imba.Scheduler')
	let inc = ['UIEvent','imba.Scheduler','imba.Component','ImbaEvents','HTMLElementTagNameMap','imbacss','Math','String','Number','imba.scheduler','imba.locals','imba.session']
	# ,'ImbaIntersectEvent','ImbaHotkeyEvent','ImbaResizeEvent','ImbaTouch','ImbaEvents'

	let events = checker.props('ImbaEvents')
	let glob = checker.props('globalThis')

	for item in glob
		let name = item.imbaName
		# console.log item.imbaName
		if name.match(/^parseInt/) or Globals[name]
			inc.push(item)
		# if name.match(/^[A-Z]/)
		#	inc.push(item)

	# return

	inc.push('Array','Set','Map','WeakSet','WeakMap','Uint8Array')

	for ev in events
		ev.#kind = 'event'


	for cssprop in checker.styleprops
		cssprop.#kind = 'styleprop'

	for ref in inc
		# console.log 'ref',ref,checker.sym(ref)
		Entry.for(checker.sym(ref))

	let js = serialize(allEntries)
	let dest = np.resolve(__dirname,'..','data','reference.js')
	nfs.writeFileSync(dest,js,'utf8')
	console.log "wrote {js.length / 1000}kb"

run!
process.exit(0)
