import {HTMLElement} from '../dom'

export class ImbaElement < HTMLElement
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

	def render?
		return true

	def mounting?
		return (__F & $EL_MOUNTING$) != 0

	def mounted?
		return (__F & $EL_MOUNTED$) != 0
	
	def awakened?
		return (__F & $EL_AWAKENED$) != 0
	
	def rendered?
		return (__F & $EL_RENDERED$) != 0

	def rendering?
		return (__F & $EL_RENDERING$) != 0
	
	def scheduled?
		return (__F & $EL_SCHEDULED$) != 0

	def hydrated?
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