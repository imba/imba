
const {Node,SVGElement} = imba.dom

const descriptorCache = {}
def getDescriptor item,key,cache
	if !item
		return cache[key] = null

	if cache[key] !== undefined
		return cache[key]
	
	let desc = Object.getOwnPropertyDescriptor(item,key)

	if desc !== undefined or item == SVGElement
		return cache[key] = desc or null

	getDescriptor(Reflect.getPrototypeOf(item),key,cache)

extend class SVGElement
	
	def set$ key,value
		let cache = descriptorCache[nodeName] ||= {}
		let desc = getDescriptor(this,key,cache)

		if !desc or !desc.set
			setAttribute(key,value)
		else
			self[key] = value
		return

if $web$
	extend class SVGElement
		def flag$ str
			let ns = flags$ns
			self.className.baseVal = ns ? (ns + (flags$ext = str)) : (flags$ext = str)
			return

		def flagSelf$ str
			# if a tag receives flags from inside <self> we need to
			# redefine the flag-methods to later use both
			self.flag$ = do(str) self.flagSync$(flags$ext = str)
			self.flagSelf$ = do(str) self.flagSync$(flags$own = str)
			return flagSelf$(str)

		def flagSync$
			self.className.baseVal = ((flags$ns or '') + (flags$ext or '') + ' ' + (flags$own || '') + ' ' + ($flags or ''))


def imba.createSVGElement name, parent, flags, text, ctx
	var el = imba.document.createElementNS("http://www.w3.org/2000/svg",name)

	if flags
		if $node$
			el.className = flags
		else
			el.className.baseVal = flags

	if parent and parent isa Node
		el.insertInto$(parent)
	return el

# currently needed for richValue override