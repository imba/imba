# import {HTMLElement} from '../dom'

const DOM = imba.dom

class imba.dom.ImbaElement < imba.dom.HTMLElement
	def constructor
		super()
		if flags$ns
			flag$ = flagExt$

		setup$()
		build()

	def setup$
		__slots = {}
		__F = 0

	def init$
		__F |= ($EL_INITED$ | $EL_HYDRATED$)
		self
		
	def flag$ str
		self.className = flags$ext = str
		return

	# returns the named slot - for context
	def slot$ name, ctx
		if name == '__' and !render
			return self

		__slots[name] ||= imba.createLiveFragment(0,null,self)

	# called immediately after construction 
	def build
		self

	# called before the first mount
	def awaken
		self
	
	# called when element is attached to document
	def mount
		self

	def unmount
		self

	# called after render
	def rendered
		self

	# called before element is stringified on server (SSR)
	def dehydrate
		self

	# called before awaken if element was not initially created via imba - on the client
	def hydrate
		# should only autoschedule if we are not awakening inside a parent context that
		autoschedule = yes
		self

	def tick
		commit()

	# called when component is (re-)rendered from its parent
	def visit
		commit()

	# Wrapper for rendering. Default implementation
	def commit
		return self unless render?
		__F |= $EL_RENDERING$
		render && render()
		rendered()
		__F = (__F | $EL_RENDERED$) & ~$EL_RENDERING$

	

	get autoschedule
		(__F & $EL_SCHEDULE$) != 0
	
	set autoschedule value
		value ? (__F |= $EL_SCHEDULE$) : (__F &= ~$EL_SCHEDULE$)

	get render?
		return true

	get mounting?
		return (__F & $EL_MOUNTING$) != 0

	get mounted?
		return (__F & $EL_MOUNTED$) != 0
	
	get awakened?
		return (__F & $EL_AWAKENED$) != 0
	
	get rendered?
		return (__F & $EL_RENDERED$) != 0

	get rendering?
		return (__F & $EL_RENDERING$) != 0
	
	get scheduled?
		return (__F & $EL_SCHEDULED$) != 0

	get hydrated?
		return (__F & $EL_HYDRATED$) != 0

	def schedule
		imba.scheduler.listen('render',self)
		__F |= $EL_SCHEDULED$
		return self

	def unschedule
		imba.scheduler.unlisten('render',self)
		__F &= ~$EL_SCHEDULED$
		return self

	def end$
		visit()

	def connectedCallback
		let flags = __F
		let inited = flags & $EL_INITED$
		let awakened = flags & $EL_AWAKENED$

		# return if we are already in the process of mounting - or have mounted
		if flags & ($EL_MOUNTING$ | $EL_MOUNTED$)
			return
		
		__F |= $EL_MOUNTING$

		unless inited
			init$()

		unless flags & $EL_HYDRATED$
			flags$ext = className
			hydrate()
			__F |= $EL_HYDRATED$
			commit()

		unless awakened
			awaken()
			__F |= $EL_AWAKENED$

		let res = mount()
		if res && res.then isa Function
			res.then(imba.commit)
		# else
		#	if this.render and $EL_RENDERED$
		#		this.render()
		flags = __F = (__F | $EL_MOUNTED$) & ~$EL_MOUNTING$
		
		if flags & $EL_SCHEDULE$
			schedule()

		return this

	def disconnectedCallback
		__F = __F & (~$EL_MOUNTED$ & ~$EL_MOUNTING$)
		unschedule() if __F & $EL_SCHEDULED$
		unmount()


# Stuff for element registry

const CustomTagConstructors = {}

class ImbaElementRegistry

	def constructor
		types = {}

	def lookup name
		return types[name]

	def get name, klass
		return DOM.ImbaElement if !name or name == 'component'
		return types[name] if types[name]
		return DOM.getElementType(name) if $node$
		return DOM[klass] if klass and DOM[klass]
		DOM.customElements.get(name) or DOM.ImbaElement

	def create name
		if types[name]
			# TODO refactor
			return types[name].create$()
		else
			imba.document.createElement(name)

	def define name, klass, options = {}
		types[name] = klass
		klass.nodeName = name

		let proto = klass.prototype
		
		# if proto.render && proto.end$ == Element.prototype.end$
		#	proto.end$ = proto.render
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

imba.tags = new ImbaElementRegistry

const proto = imba.dom.ImbaElement.prototype

def imba.createComponent name, parent, flags, text, ctx
	# the component could have a different web-components name?
	var el
	
	if typeof name != 'string'
		if name and name.nodeName
			name = name.nodeName

	if CustomTagConstructors[name]
		el = CustomTagConstructors[name].create$(el)
		# extend with mroe stuff
		
		el.slot$ = proto.slot$
		el.__slots = {}
	else
		el = imba.document.createElement(name)

	el.##parent = parent
	el.init$()

	if text !== null
		el.slot$('__').text$(text)
		
	if flags or el.flags$ns # or nsflag
		el.flag$(flags or '')
	return el