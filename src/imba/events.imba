const keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	del: [8,46]
}

if $web$
	# only for web?
	extend class Event
		
		def wait$mod state, params
			Promise.new do |resolve|
				setTimeout(resolve,(params[0] isa Number ? params[0] : 1000))

		def sel$mod state, params
			return state.event.target.closest(params[0]) or false

		def throttle$mod {handler,element,event}, params
			return false if handler.throttled
			handler.throttled = yes
			let name = params[0]
			unless name isa String
				name = "in-{event.type or 'event'}"
			let cl = element.classList
			cl.add(name)
			handler.once('idle') do
				cl.remove(name)
				handler.throttled = no
			return true


# could cache similar event handlers with the same parts
export class EventHandler
	def constructor params,closure
		@params = params
		@closure = closure

	def getHandlerForMethod el, name
		return null unless el
		el[name] ? el : @getHandlerForMethod(el.parentNode,name)

	def emit name, ...params do imba.emit(self,name,params)
	def on name, ...params do imba.listen(self,name,...params)
	def once name, ...params do imba.once(self,name,...params)
	def un name, ...params do imba.unlisten(self,name,...params)

	def handleEvent event
		var target = event.target
		var element = event.currentTarget
		var mods = @params
		var i = 0
		let commit = yes # @params.length == 0
		let awaited = no
		let prevRes = undefined

		# console.log 'handle event',event.type,@params
		@currentEvents ||= Set.new
		@currentEvents.add(event)

		let state = {
			element: element
			event: event
			modifiers: mods
			handler: this
		}

		for own handler,val of mods
			# let handler = part
			if handler.indexOf('~') > 0
				handler = handler.split('~')[0]

			let args = [event,self]
			let res = undefined
			let context = null

			# parse the arguments
			if val isa Array
				args = val.slice()

				for par,i in args
					# what about fully nested arrays and objects?
					# ought to redirect this
					if typeof par == 'string' && par[0] == '~' and par[1] == '$'
						let name = par.slice(2)
						let target = event

						if name[0] == '$'
							target = target.detail
							name = name.slice(1)

						if name == 'el' and target == event
							args[i] = element
						elif name == 'value' and target == event
							args[i] = state.value
						elif name == ''
							args[i] = target
						else
							args[i] = target ? target[name] : null

			# console.log "handle part",i,handler,event.currentTarget
			# check if it is an array?
			if handler == 'stop'
				event.stopImmediatePropagation()
			elif handler == 'prevent'
				event.preventDefault()
			elif handler == 'ctrl'
				break unless event.ctrlKey
			elif handler == 'commit'
				commit = yes
			elif handler == 'silence'
				commit = no
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

			elif handler == 'trigger'
				let name = args[0]
				let detail = args[1] # is custom event if not?
				let e = true ? CustomEvent.new(name, bubbles: true, detail: detail) : Event.new(name)
				e.originalEvent = event
				let customRes = element.dispatchEvent(e)

			elif typeof handler == 'string'
				let mod = handler + '$mod'

				if event[mod] isa Function
					# console.log "found modifier!",mod
					handler = mod
					context = event
					args = [state,args]

				# should default to first look at closure - no?
				elif handler[0] == '_'
					handler = handler.slice(1)
					context = @closure
				else
					context = @getHandlerForMethod(element,handler)


			if context
				res = context[handler].apply(context,args)

			elif handler isa Function
				res = handler.apply(element,args)

			if res and res.then isa Function
				imba.commit() if commit
				awaited = yes
				# TODO what if await fails?
				res = await res

			if res === false
				break

			state.value = res

		imba.commit() if commit
		@currentEvents.delete(event)
		if @currentEvents.size == 0
			@emit('idle')
		# what if the result is a promise
		return
