import np from 'path'
export {tagNameToClassName} from './schemas'

const DEBUGGING = process.env.TSS_DEBUG
let TRACING = null
class Logger
	constructor
		nr = 0
		logs = []
		sent = []
		received = []
		state = {}
		
	get last
		logs[0]
	
	def group ...params
		call('group',...params)
		
	def groupEnd ...params
		call('groupEnd',...params)
		
	def warn ...params
		return unless process.env.TSS_DEBUG
		call('warn',...params)
	
	def call typ, ...params
		return unless process.env.TSS_DEBUG
		
		if console.context isa Function
			console.context![typ](...params)
			return
	
	def log ...params
		return unless process.env.TSS_DEBUG

		let ns = params[0]
		let data = params[1]
		let id = ++nr
		state[ns] ||= []
		state[ns].unshift([id].concat(params.slice(1)))
		
		if console.context isa Function
			console.context!.log(...params)
			return

		if TRACING
			TRACING.push(params)

		if ns == 'send'
			if data.type == 'event'
				sent.unshift Object.assign({e: data.event},data.body)
			elif data.type == 'response'
				sent.unshift Object.assign({c: data.command},data.body)
		elif ns == 'receive'
			if data.type == 'request'
				received.unshift Object.assign({c: data.command},data.arguments)

		logs.unshift([id,...params])

global.logger = new Logger

export const state = {
	
}

export def normalizePath path
	path.split(np.sep).join('/')
	
export def pathToImportName path
	np.basename(path).replace(/\.(d\.ts|tsx?|imba|jsx?)$/,'')

export def nameForPath path
	np.basename(path)

export def dirForPath path
	np.dirname(path)

export def extensionForPath path
	(path.match(/\.(d\.ts|tsx?|imba|jsx?|\w{1,4})$/) or ['',''])[1]
	
export def normalizeImportPath source, referenced
	if np.isAbsolute(referenced)
		let fdir = np.dirname(source)
		let sdir = np.dirname(referenced)
		let path = normalizePath(np.relative(np.dirname(source),referenced).replace(/\.imba$/,''))
		let nmi = path.indexOf('node_modules')
		if nmi >= 0
			path = path.slice(nmi + 13)
		path = './' + path if !path.match(/^\.\.?\//)
		return path
	return referenced

export def resolveImportPath source, referenced
	if !np.isAbsolute(referenced)
		return normalizePath( np.resolve(np.dirname(source),referenced) )
	return referenced

let fillCache = {}

export def trace cb
	let t = TRACING = []
	let res = cb()
	TRACING = null
	return {result: res, logs: t}
	

# export def fromJSIdentifier str
# 	str[0] + str.slice(1).replace(/\$$/,'?').replace(/\$/g,'-')
# 
# export def toJSIdentifier str
# 	str.replace(/[-\?]/g,'$')

export def zerofill num, digits = 4
	return fillCache[num] if fillCache[num]
	let str = String(num)
	str = "0000000000".slice(0,9 - str.length) + str
	return fillCache[num] = str.slice(-digits)
	
export def extend target, klass
	let descriptors = Object.getOwnPropertyDescriptors(klass.prototype)
	for own k,v of descriptors
		continue if k == 'constructor' # or !(v.value isa Function)
		let sym = Symbol.for("#{k}")
		target[sym] = target[k] # .bind(target)
		# let prev = Object.getOwnPropertyDescriptor(target,k)
		# console.log "extend?!",k,v,prev
		Object.defineProperty(target,k,v)
		# target[k] = v.value # v.bind(target)
	return target

export def unquote str
	if str[0] == '"' and str[str.length - 1] == '"'
		return str.slice(1,-1)
	return str
	
export def log ...params
	return unless DEBUGGING
	global.logger.log(...params)
	
export def warn ...params
	return unless DEBUGGING
	global.logger.warn(...params)
	
export def group ...params
	return unless DEBUGGING
	global.logger.group(...params)

export def groupEnd ...params
	return unless DEBUGGING
	global.logger.groupEnd(...params)
	
export def isImba src
	return false unless src
	src.substr(src.lastIndexOf(".")) == '.imba'
	
export def isImbaDts src
	return false unless src
	return src.indexOf(".imba._.d.ts") > 0

export def isDts src
	return false unless src
	return src.indexOf(".d.ts") > 0

export def isImbaStdts src
	return false unless src
	return src.indexOf(".d.ts") > 0 and src.match(/imba-typings|imba\/typings/)

export def delay target, name, timeout = 500, params = []
	let meta = target.#timeouts ||= {}

	global.clearTimeout(meta[name])
	meta[name] = global.setTimeout(&,timeout) do
		call(target,name,params)

export def cancel target, name
	let meta = target.#timeouts ||= {}
	global.clearTimeout(meta[name])
	delete meta[name]

export def call target,name,params
	cancel(target,name)
	target[name](...params)

export def flush target, name,...params
	let meta = target.#timeouts ||= {}
	call(target,name,params) if meta[name]
	
	

# To avoid collisions etc with symbols we are using
# greek characters to convert special imba identifiers
# to valid js identifiers.
export const ToJSMap = {
	'-': 'Ξ'
	'?': 'Φ'
	'#': 'Ψ'
	'@': 'α'
}

const toJSregex = new RegExp("[\-\?\#\@]","gu")
const toJSreplacer = do(m) ToJSMap[m]

export def toJSIdentifier raw
	raw.replace(toJSregex,toJSreplacer)

export const ToImbaMap = {
	'Ξ': '-'
	'Φ': '?'
	'Ψ': '#'
	'Γ': ''
	'α': '@'
}

const toImbaRegex = new RegExp("[ΞΦΨΓα]","gu")
const toImbaReplacer = do(m) ToImbaMap[m]

export def toImbaIdentifier raw
	if raw and raw[0] == 'Ω'
		raw = raw.split('Ω')[1]

	raw ? raw.replace(toImbaRegex,toImbaReplacer) : raw
	
export def toImbaString str
	unless typeof str == 'string'
		log('cannot convert to imba string',str)
		return str

	str = str.replace(toImbaRegex,toImbaReplacer)
	return str
	
export def toImbaMessageText str
	if typeof str == 'string'
		return toImbaString(str)
	if str.messageText
		str.messageText = toImbaMessageText(str.messageText)
	
	return str
	

export def fromJSIdentifier raw
	toImbaIdentifier(raw)
	
export def displayPartsToString parts
	fromJSIdentifier(global.ts.displayPartsToString(parts))
	
extend class String
	def toimba
		toImbaIdentifier(this)
	
	def tojs
		toJSIdentifier(this)

export def toImbaDisplayParts parts
	for part in parts
		# if part.text[0] == 'Ω'
		part.text = toImbaIdentifier(part.text)
		# part.text.replace(toImbaRegex,toImbaReplacer)
	return parts


export def isPascal str
	let chr = str.charCodeAt(0)
	return chr >= 65 && 90 >= chr

export def toPascalCase str
	str.replace(/(^|[\-\_\s])(\w)/g) do(m,v,l) l.toUpperCase!

export def toCustomTagIdentifier str
	'Γ' + toJSIdentifier(str)
	# toPascalCase(str + '-custom-element')

export def isTagIdentifier str
	str[0] == 'Γ'

export def isClassExtension str
	str[0] == 'Ω'

export def jsDocTagTextToString content
	let out = ''
	content = [content] unless content isa Array

	for item in content
		item = item.text if item.text
		if typeof item == 'string'
			out += item
	return out

const dasherizeCache = {}
export def dasherize str
	dasherizeCache[str] ||= str.replace(/([a-z\d])([A-Z])/g,"$1-$2").toLowerCase!

export class Component
	def constructor(...params)
		$timeouts = {}
		self

	get config
		config

	def $delay name, timeout = 500
		global.clearTimeout($timeouts[name])
		$timeouts[name] = global.setTimeout(&,timeout) do $call(name)

	def $cancel name
		global.clearTimeout($timeouts[name])
		delete $timeouts[name]
		let item = global.window

	def $call name,...params
		$cancel(name)
		self[name](...params)

	def $flush name,...params
		$call(name,...params) if $timeouts[name]
		
	def $stamp label = 'time'
		#prev ||= Date.now!
		let now = Date.now!
		console.log "{label}: {now - #prev}"
		#prev = now
		self
		
	def lookupKey key
		return null
		
	def lookupRef ids,index = 0
		if typeof ids == 'string'
			ids = ids.split('|')

		let key = ids[index]
		return self if key === null

		let item = lookupKey(key)
		if item
			return item if ids.length == (index + 1)
			return item.lookupRef(ids,index + 1)

	def log ...params
		if config.get('verbose')
			console.log(...params)
		return

	def devlog ...params
		if $web$ or config.get('debug')
			console.log(...params)
		return
	
	def inspect object
		if config.get('verbose')
			console.dir(object, depth: 10)
		return

export def flagsToString num, flags
	let out = {
		toString: do this.#string
		valueOf: do flags
	}
	let m = {}

	for own k,v of flags when typeof v == 'number'
		if num & v and k.indexOf('Excludes') == -1 and k != 'All'
			m[k] = yes
	Object.assign(out,m)
	out.#string = Object.keys(m).join(' ')
	return out

export class Writer
	name
	stack = []
	out = ''
	pre = ''
	
	def w ln
		out += pre + ln + '\n'
	
	def ind wrap,cb
		push(wrap)
		cb()
		pop!

	def push wrap, state = wrap
		w(wrap + ' {') if wrap
		stack.unshift(state)
		pre += '\t'
	
	def pop wrap
		pre = pre.slice(0,-1)
		stack.shift!
		w('}\n')
		
	def popAll
		while stack.length
			pop!
		return self
		
	get state
		stack[0]
		
	def save
		yes
		
	def toString
		out