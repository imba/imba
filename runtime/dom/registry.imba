const CustomTagConstructors = {}

class ImbaElementRegistry

	def constructor
		types = {}

	def lookup name
		return types[name]

	def get name, klass
		return ImbaElement if !name or name == 'component'
		return types[name] if types[name]
		return DOM.getElementType(name) if $node$
		return DOM[klass] if klass and DOM[klass]
		DOM.customElements.get(name) or DOM.ImbaElement

	def create name
		if types[name]
			# TODO refactor
			return types[name].create$()
		else
			doc.createElement(name)

	def define name, klass, options = {}
		types[name] = klass
		klass.nodeName = name

		let proto = klass.prototype
		
		let basens = proto._ns_
		if options.ns
			let ns = options.ns
			let flags = ns + ' ' + ns + '_ '
			if basens
				flags += proto.flags$ns 
				ns += ' ' + basens
			proto._ns_ = ns
			proto.flags$ns = flags

		if options.extends
			CustomTagConstructors[name] = klass
		else
			DOM.customElements.define(name,klass)
		return klass

export const tags = new ImbaElementRegistry