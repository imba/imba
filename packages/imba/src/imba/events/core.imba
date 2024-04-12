# imba$imbaPath=global
# imba$stdlib=1
$node$ import {Element,Event,KeyboardEvent,MouseEvent,CustomEvent} from '../dom/core'
import {listen,once,emit,unlisten,parseTime} from '../utils'
import {scheduler} from '../scheduler'

import {use_events_keyboard} from './keyboard'
use_events_keyboard!

import {use_events_mouse} from './mouse'
use_events_mouse!

extend class CustomEvent

	def #extendType kls
		let ext = kls.#extendDescriptors ||= if true
			let desc = Object.getOwnPropertyDescriptors(kls.prototype)
			delete desc.constructor
			desc
		Object.defineProperties(self,ext)

# this should clearly much rather export the real one
extend class Event

	get original\this
		originalEvent or self

	get #modifierState
		#context[#context.step] ||= {}

	get #sharedModifierState
		#context.handler[#context.step] ||= {}

	def #onceHandlerEnd cb
		once(#context,'end',cb)
	
	###
	Only trigger handler if event.target matches selector
	@detail (selector)
	###
	def @sel selector
		return !!target.matches(String(selector))

	def @closest selector
		return !!target.closest(String(selector))

	###
	Tells the browser that the default action should not be taken. The event will still continue to propagate up the tree. See Event.preventDefault()
  @see https://imba.io/events/event-modifiers#core-prevent
	###
	def @prevent
		#defaultPrevented = yes
		preventDefault!
		return yes

	###
	Cancel propagation and prevent default
	###
	def @trap
		#stopPropagation = yes
		stopImmediatePropagation()
		#defaultPrevented = yes
		preventDefault()
		return yes

	###
	Only continue if element contains the currently focused element (document.activeElement)
	Optionally pass in a selector to check a relative parent.
	TODO: Document
	###
	def @focin sel
		let el = #context.element
		el = sel isa Element ? sel : (sel ? el.closest(sel) : el)
		return el..contains(global.document.activeElement)

	def @log ...params
		console.info(...params)
		return true

	def @trusted
		return !!isTrusted

	def @if expr
		return !!expr

	def @wait time = 250
		new Promise(do setTimeout($1,parseTime(time)))

	def @self
		return target == #context.element

	def @cooldown time = 250
		let o = #sharedModifierState

		if o.active
			return no

		o.active = yes
		o.target = #context.element
		o.target.flags.incr('cooldown')

		#onceHandlerEnd do
			setTimeout(&,parseTime(time)) do
				o.target.flags.decr('cooldown')
				o.active = no

		return yes

	def @throttle time = 250
		let o = #sharedModifierState

		if o.active
			o.next(no) if o.next

			return new Promise do(r)
				o.next = do(val)
					o.next = null
					r(val)

		o.active = yes
		o.el ||= #context.element
		o.el.flags.incr('throttled')

		once(#context,'end') do
			let delay = parseTime(time)

			o.interval = setInterval(&,delay) do
				if o.next
					o.next(yes)
				else
					clearInterval(o.interval)
					o.el.flags.decr('throttled')
					o.active = no
				return

		return yes

	def @debounce time = 250
		let o = #sharedModifierState
		let e = self
		o.queue ||= []
		o.queue.push(o.last = e)
		new Promise do(resolve)
			setTimeout(&,parseTime(time)) do
				if o.last == e
					# if this event is still the last
					# add the debounced queue to the event
					# and let the chain continue
					e.debounced = o.queue
					o.last = null
					o.queue = []
					resolve(true)
				else
					resolve(false)

	# will add a css className to the element (or selector)
	# and keep it for the duration of the event handling,
	# or at least 250ms
	def @flag name, sel
		const {element,step,state,id,current} = #context

		let el = sel isa Element ? sel : (sel ? element.closest(sel) : element)

		return true unless el

		#context.commit = yes

		state[step] = id
		el.flags.incr(name)

		let ts = Date.now!

		once(current,'end') do
			let elapsed = Date.now! - ts
			let delay = Math.max(250 - elapsed,0)
			setTimeout(&,delay) do el.flags.decr(name)

		return true

	def @busy sel
		# TODO REMOVE
		# Add via
		self['αflag']('busy',sel)

	def @outside
		# TODO Support selector here?
		const {handler} = #context
		if handler and handler.#self
			return !handler.#self.parentNode.contains(target)

	def @post url, o = {}
		await global.fetch url, { method:'POST', ...o }

	def @fetch url, o = {}
		await global.fetch url, o

export const events = {}

export def use_events
	global.imba.uses_events = yes
	yes

# could cache similar event handlers with the same parts
# Should be possible to remove closure from EventHandler
export class EventHandler
	def constructor params,closure
		self.params = params
		self.closure = closure

	def getHandlerForMethod el, name
		return null unless el
		el[name] ? el : self.getHandlerForMethod(el.parentNode,name)

	def abortCurrentHandlers
		if currentEvents
				for ev of currentEvents
					ev.aborted = yes
					ev..resolver(yes)
		self

	# okay to auto-import these?
	def emit name, ...params do emit(self,name,params)
	def on name, ...params do listen(self,name,...params)
	def once name, ...params do once(self,name,...params)
	def un name, ...params do unlisten(self,name,...params)

	get passive?
		params.passive

	get capture?
		params.capture

	get silent?
		params.silent

	get global?
		params.global

	def handleEvent event
		return if self.disabled

		let element = #target or event.currentTarget
		let mods = self.params
		# let i = 0
		# let awaited = no
		let error = null
		let silence = mods.silence or mods.silent

		self.count ||= 0
		self.state ||= {}

		let state = self.lastState = {
			element: element
			event: event
			modifiers: mods
			handler: this
			id: ++self.count
			step: -1
			state: self.state
			commit: null
			called: no
			current: null
			aborted: no
		}

		state.current = state

		if event.handle$mod
			if event.handle$mod.apply(state,mods.options or []) == false
				return

		let guard = Event[self.type + '$handle'] or Event[event.type + '$handle'] or event.handle$mod or self.guard

		if guard and guard.apply(state,mods.options or []) == false
			return

		# let object = state.proxy or event

		self.currentEvents ||= new Set
		self.currentEvents.add(state)

		for own handler,val of mods
			break if state.aborted

			state.step++

			if handler[0] == '_'
				continue

			if handler.indexOf('~') > 0
				handler = handler.split('~')[0]

			let modargs = null
			let args = [event,state]
			let res = undefined
			let context = null
			let m
			let negated = no
			let isstring = typeof handler == 'string'

			if handler[0] == '$' and handler[1] == '_' and val[0] isa Function
				# handlers should commit by default
				handler = val[0]
				state.called = yes
				state.commit = yes unless handler.passive #
				args = [event,state].concat(val.slice(1))
				context = element

			# parse the arguments
			elif val isa Array
				args = val.slice()
				modargs = args

				for par,i in args
					# what about fully nested arrays and objects?
					# ought to redirect this
					if typeof par == 'string' && par[0] == '~' and par[1] == '$'
						let name = par.slice(2)
						let chain = name.split('.')
						let value = state[chain.shift()] or event

						for part,i in chain
							value = value ? value[part] : undefined

						args[i] = value

			if typeof handler == 'string' and m = handler.match(/^(emit|flag|mod|moved|pin|fit|refit|map|remap|css)-(.+)$/)
				modargs = args = [] unless modargs
				args.unshift(m[2])
				handler = m[1]

			if handler == 'trap'
				event.#stopPropagation = yes
				event.stopImmediatePropagation()
				event.#defaultPrevented = yes
				event.preventDefault()

			elif handler == 'stop'
				event.#stopPropagation = yes
				event.stopImmediatePropagation()
			elif handler == 'prevent'
				event.#defaultPrevented = yes
				event.preventDefault()
			elif handler == 'commit'
				state.commit = yes

			elif handler == 'once'
				# clean up bound data as well
				element.removeEventListener(event.type,self)
			elif handler == 'options' or handler == 'silence' or handler == 'silent'
				continue

			elif handler == 'emit'
				let name = args[0]
				let detail = args[1] # is custom event if not?
				state.called = yes
				let e = new CustomEvent(name, bubbles: true, detail: detail) # : new Event(name)
				e.originalEvent = event
				let source = #teleport or element
				let customRes = source.dispatchEvent(e)
				# TODO Add reference to this event to the current handler context?

			elif typeof handler == 'string'
				if handler[0] == '!'
					negated = yes
					handler = handler.slice(1)

				let path = "α{handler}"

				let fn = event[path]
				fn ||= (self.type and Event[self.type + '$' + handler + '$mod'])
				fn ||= event[handler + '$mod'] or Event[event.type + '$' + handler] or Event[handler + '$mod']

				if fn isa Function
					handler = fn
					context = state
					args = modargs or []

					if event[path]
						context = event
						event.#context = state

				# should default to first look at closure - no?
				elif handler[0] == '_'
					handler = handler.slice(1)
					context = self.closure
				else
					# TODO deprecate this functionality and warn about it?
					context = self.getHandlerForMethod(element,handler)

			try
				if handler isa Function
					res = handler.apply(context or element,args)
				elif context
					res = context[handler].apply(context,args)

				if res and res.then isa Function and res != scheduler.$promise
					scheduler.commit! if state.commit and !silence
					res = await res
			catch e
				error = e
				break

			if negated and res === true
				break
			if !negated and res === false
				break

			state.value = res

		emit(state,'end',state)

		scheduler.commit! if state.commit and !silence

		self.currentEvents.delete(state)
		if self.currentEvents.size == 0
			self.emit('idle')
		# what if the result is a promise

		if error != undefined
			if self.type != 'error'

				let detail = error isa Error ? error.message : error
				let custom = new CustomEvent('error',{detail: detail, bubbles: true, cancelable: true})
				# @ts-ignore
				custom.error = error
				# @ts-ignore
				custom.originalEvent = event
				let res = element.dispatchEvent(custom)
				# @ts-ignore
				return if custom.defaultPrevented

			throw error

		return state

# Add methods to Element
extend class Element

	def on$ type, mods, scope
		let check = 'on$' + type
		let capture = mods.capture or no
		let passive = mods.passive
		let handler

		let o = capture

		if passive
			o = {passive: passive, capture: capture}

		# check if a custom handler exists for this type?
		if self[check] isa Function
			if self[check].length > 2
				handler = new EventHandler(mods,scope)

			handler = self[check](mods,scope,handler,o)
		else
			handler = new EventHandler(mods,scope)
			self.addEventListener(type,handler,o)
		return handler

	def on$error mods,context,handler,o
		if mods.options..length
			handler.guard = do(...types)
				let err = this.event.error
				let match = types.find do err isa $1
				return !!match

		self.addEventListener('error',handler,o)
		return handler
