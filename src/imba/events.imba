import {Event} from './dom'

const keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	left: [37],
	right: [39],
	del: [8,46]
}

def Event.log$mod ...params
	console.log(...params)
	return true

# Skip unless matching selector
def Event.sel$mod expr
	return !!event.target.matches(String(expr))
	
def Event.if$mod expr
	return !!expr
	
def Event.wait$mod num = 250
	new Promise(do setTimeout($1,num))
	
def Event.throttle$mod ms = 250
	return false if handler.throttled
	handler.throttled = yes

	let cl = element.flags.add('_cooldown_')

	handler.once('idle') do
		setTimeout(&,ms) do
			element.flags.remove('_cooldown_')
			handler.throttled = no
	return true
	
def Event.flag$mod name,sel
	# console.warn 'event flag',self,arguments,id,step
	let el = sel isa global.Element ? sel : (sel ? element.closest(sel) : element)
	return true unless el
	let step = step
	handler[step] = id

	el.flags.add(name)
	let ts = Date.now!
	handler.once('idle') do
		let elapsed = Date.now! - ts
		let delay = Math.max(250 - elapsed,0)
		setTimeout(&,delay) do
			# console.warn 'event flag after',self,handler[step],id,step
			el.flags.remove(name) if handler[step] == id

	return true
	
def Event.busy$mod sel
	return Event.flag$mod.call(this,'busy',250,sel)

# could cache similar event handlers with the same parts
export class EventHandler
	def constructor params,closure
		self.params = params
		self.closure = closure

	def getHandlerForMethod el, name
		return null unless el
		el[name] ? el : self.getHandlerForMethod(el.parentNode,name)

	def emit name, ...params do imba.emit(self,name,params)
	def on name, ...params do imba.listen(self,name,...params)
	def once name, ...params do imba.once(self,name,...params)
	def un name, ...params do imba.unlisten(self,name,...params)

	def handleEvent event
		var target = event.target
		var element = event.currentTarget
		var mods = self.params
		var i = 0
		let commit = yes # self.params.length == 0
		let awaited = no
		let prevRes = undefined
		
		self.count ||= 0

		let state = {
			element: element
			event: event
			modifiers: mods
			handler: this
			id: ++self.count
			step: -1
		}

		if event.handle$mod
			if event.handle$mod.call(state,mods.options) == false
				return

		let guard = Event[event.type + '$handle']
			
		if guard and guard.call(state,mods.options) == false
			return
		
		self.currentEvents ||= new Set
		self.currentEvents.add(event)	

		for own handler,val of mods
			state.step++

			if handler[0] == '_'
				continue

			if handler.indexOf('~') > 0
				handler = handler.split('~')[0]
			
			let modargs = null
			let args = [event,self]
			let res = undefined
			let context = null
			let m
			let isstring = typeof handler == 'string'
			
			if handler[0] == '$' and handler[1] == '_' and val[0] isa Function
				handler = val[0]
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

			if typeof handler == 'string' and m = handler.match(/^(emit|flag)-(.+)$/)
				modargs = args = [] unless modargs
				args.unshift(m[2])
				handler = m[1]
			
			# console.log "handle part",i,handler,event.currentTarget
			# check if it is an array?
			if handler == 'stop'
				event.stopImmediatePropagation()
			elif handler == 'prevent'
				event.preventDefault()
			elif handler == 'commit'
				commit = yes
			elif handler == 'silence' or handler == 'silent'
				commit = no
			elif handler == 'ctrl'
				break unless event.ctrlKey
			elif handler == 'alt'
				break unless event.altKey
			elif handler == 'shift'
				break unless event.shiftKey
			elif handler == 'meta'
				break unless event.metaKey
			elif handler == 'self'
				break unless target == element

			elif handler == 'once'
				# clean up bound data as well
				element.removeEventListener(event.type,self)
			elif handler == 'options'
				continue

			elif keyCodes[handler]
				unless keyCodes[handler].indexOf(event.keyCode) >= 0
					break

			elif handler == 'emit'
				let name = args[0]
				let detail = args[1] # is custom event if not?
				let e = new CustomEvent(name, bubbles: true, detail: detail) # : new Event(name)
				e.originalEvent = event
				let customRes = element.dispatchEvent(e)

			elif typeof handler == 'string'
				let fn = Event[handler + '$mod'] or Event[event.type + '$' + handler]
				
				if fn isa Function
					handler = fn
					context = state
					args = modargs or []

				# should default to first look at closure - no?
				elif handler[0] == '_'
					handler = handler.slice(1)
					context = self.closure
				else
					context = self.getHandlerForMethod(element,handler)

			if handler isa Function
				res = handler.apply(context or element,args)
			elif context
				res = context[handler].apply(context,args)

			if res and res.then isa Function and res != imba.scheduler.$promise
				imba.$commit! if commit
				awaited = yes
				# TODO what if await fails?
				res = await res

			if res === false
				break

			state.value = res

		imba.$commit! if commit
		self.currentEvents.delete(event)
		if self.currentEvents.size == 0
			self.emit('idle')
		# what if the result is a promise
		return
