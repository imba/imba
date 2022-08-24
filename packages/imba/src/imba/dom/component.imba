# imba$stdlib=1

import {Node,HTMLElement,CUSTOM_TYPES} from './core'
import {createLiveFragment,createSlot} from './fragment'
import {scheduler} from '../scheduler'

import {renderer} from './context'
import {emit} from '../utils'

const hydrator = new class
	items = []
	current = null
	lastQueued = null
	tests = 0

	def flush
		let item = null

		while item = items.shift!
			continue if !item.parentNode or item.hydrated?
			# Mark as inited to stop connectedCallback from early exit
			let prev = current
			current = item
			item.__F |= $EL_SSR$
			item.connectedCallback!
			current = prev
		return

	def queue item
		# let len = items.push(item)
		let len = items.length
		let idx = 0
		let prev = lastQueued
		lastQueued = item

		let BEFORE = Node.DOCUMENT_POSITION_PRECEDING
		let AFTER = Node.DOCUMENT_POSITION_FOLLOWING

		if len
			let prevIndex = items.indexOf(prev)
			let index = prevIndex

			let compare = do(a,b)
				tests++
				a.compareDocumentPosition(b)

			if prevIndex == -1 or prev.nodeName != item.nodeName
				index = prevIndex = 0

			let curr = items[index]

			while curr and compare(curr,item) & AFTER
				curr = items[++index]

			if index != prevIndex
				curr ? items.splice(index,0,item) : items.push(item)
			else
				while curr and compare(curr,item) & BEFORE
					curr = items[--index]
				if index != prevIndex
					curr ? items.splice(index + 1,0,item) : items.unshift(item)
		else
			items.push(item)
			global.queueMicrotask(flush.bind(self)) if !current

		return

export def hydrate
	hydrator.flush!

export class Component < HTMLElement
	def constructor
		super()
		if flags$ns
			# explain?
			flag$ = flagExt$

		setup$()
		build()

	def setup$
		__slots = {}
		__F = 0

	def #__init__
		__F |= ($EL_INITED$ | $EL_HYDRATED$)
		self

	def ##inited
		#__hooks__.inited(self) if #__hooks__
		
	def flag$ str

		self.className = flags$ext = str
		return

	# called immediately after construction 
	def build
		self

	# called before the first mount
	def awaken
		self
	
	# called when element is attached to document
	def mount
		self
	
	# called when element is detached from document
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
		unless render?
			__F |= $EL_UNRENDERED$
			return self
		__F |= $EL_RENDERING$ 
		render && render()
		rendered()
		__F = (__F | $EL_RENDERED$) & ~$EL_RENDERING$ & ~$EL_UNRENDERED$

	get autoschedule
		(__F & $EL_SCHEDULE$) != 0
	
	set autoschedule value
		value ? (__F |= $EL_SCHEDULE$) : (__F &= ~$EL_SCHEDULE$)

	###
	Naming and accepted values will likely change - experimental

	yes = render on events / imba.commit
	no = force manual render
	null / undefined = render via parent
	(n)s = render every n s
	(n)ms = render every n ms
	(n)fps = render n times per second
	###
	set autorender value
		let o = #autorender ||= {}
		o.value = value
		scheduler.schedule(self,o) if mounted?
		return

	get render?
		return !suspended?

	get mounting?
		return (__F & $EL_MOUNTING$) != 0

	get mounted?
		return (__F & $EL_MOUNTED$) != 0
	
	get awakened?
		return (__F & $EL_AWAKENED$) != 0
	
	get rendered?
		return (__F & $EL_RENDERED$) != 0

	get suspended?
		return (__F & $EL_SUSPENDED$) != 0

	get rendering?
		return (__F & $EL_RENDERING$) != 0
	
	get scheduled?
		return (__F & $EL_SCHEDULED$) != 0

	get hydrated?
		return (__F & $EL_HYDRATED$) != 0

	get ssr?
		return (__F & $EL_SSR$) != 0

	def schedule
		scheduler.on('commit',self)
		__F |= $EL_SCHEDULED$
		return self

	def unschedule
		scheduler.un('commit',self)
		__F &= ~$EL_SCHEDULED$
		return self

	def suspend cb = null
		let val = flags.incr('_suspended_')
		__F |= $EL_SUSPENDED$
		if cb isa Function
			await cb()
			unsuspend!
		self

	def unsuspend
		let val = flags.decr('_suspended_')
		if val == 0
			__F &= ~$EL_SUSPENDED$
			commit! if $EL_UNRENDERED$

		self
		
	def #afterVisit
		visit()
		##visitContext = null if ##visitContext

	def #beforeReconcile
		if __F & $EL_SSR$
			__F = __F & ~$EL_SSR$
			# remove flag
			# not if ssr?!
			classList.remove('_ssr_')
			if flags$ext and flags$ext.indexOf('_ssr_') == 0
				flags$ext = flags$ext.slice(5)
			# TODO document this behaviour
			innerHTML = '' unless __F & $EL_RENDERED$

		if global.DEBUG_IMBA
			renderer.push(self)
		##visitContext = null if ##visitContext
		self

	def #afterReconcile
		if global.DEBUG_IMBA
			renderer.pop(self)
		self


	def connectedCallback
		let flags = __F
		let inited = flags & $EL_INITED$
		let awakened = flags & $EL_AWAKENED$

		if !inited and !(flags & $EL_SSR$)
			hydrator.queue(self)
			return

		# return if we are already in the process of mounting - or have mounted
		if flags & ($EL_MOUNTING$ | $EL_MOUNTED$)
			return
		
		__F |= $EL_MOUNTING$

		unless inited
			#__init__!

		unless flags & $EL_HYDRATED$
			# clearly seems wrong?
			flags$ext = className
			__F |= $EL_HYDRATED$
			self.hydrate()
			commit()

		unless awakened
			awaken()
			__F |= $EL_AWAKENED$

		emit(self,'mount')
		let res = mount()
		if res && res.then isa Function
			res.then(scheduler.commit)

		flags = __F = (__F | $EL_MOUNTED$) & ~$EL_MOUNTING$
		
		if flags & $EL_SCHEDULE$
			schedule()
		
		
		scheduler.schedule(self,#autorender) if #autorender
		return this

	def disconnectedCallback
		__F = __F & (~$EL_MOUNTED$ & ~$EL_MOUNTING$)
		if __F & $EL_SCHEDULED$
			# trigger potential unschedule listeners
			unschedule()
		emit(self,'unmount')
		unmount()
		scheduler.unschedule(self,#autorender) if #autorender

# Backwards compatibility
export const ImbaElement = Component