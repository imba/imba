var keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	del: [8,46]
}

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
		var parts = @params
		var i = 0
		let commit = yes # @params.length == 0
		let awaited = no
		let prevRes = undefined

		# console.log 'handle event',event.type,@params
		@currentEvents ||= Set.new
		@currentEvents.add(event)

		for part,i in @params
			let handler = part
			let args = [event]
			let res = undefined
			let context = null

			# parse the arguments
			if handler isa Array
				args = handler.slice(1)
				handler = handler[0]

				for param,i in args
					# what about fully nested arrays and objects?
					# ought to redirect this
					if typeof param == 'string' && param[0] == '~'
						let name = param.slice(2)

						if param[1] == '&'
							# reference to a cache slot
							# the cache-slot should really be set on the array
							# the alternative would be for 
							args[i] = this[name]

						elif param[1] == '$'
							let target = event

							if name[0] == '$'
								target = target.detail
								name = name.slice(1)

							if name == 'el' and target == event
								args[i] = element
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
				event.currentTarget.removeEventListener(event.type,self)
			elif keyCodes[handler]
				unless keyCodes[handler].indexOf(event.keyCode) >= 0
					break
			elif handler == 'trigger'
				let name = args[0]
				let detail = args[1] # is custom event if not?
				let e = true ? CustomEvent.new(name, bubbles: true, detail: detail) : Event.new(name)
				e.originalEvent = event
				let customRes = element.dispatchEvent(e)
				# console.log 'triggering event',element,name,detail,e
				# wait for this handling as well?

			elif typeof handler == 'string'
				let mod = handler + '$mod'

				if event[mod] isa Function
					# console.log "found modifier!",mod
					handler = mod
					context = event
					args = [this,event,args,i]

				# should default to first look at closure - no?
				elif handler[0] == '@'
					handler = handler.slice(1)
					context = @closure
				else
					context = @getHandlerForMethod(element,handler)


			if context
				res = context[handler].apply(context,args)

			elif handler isa Function
				res = handler.apply(element,args)

			if res and res.then
				imba.commit() if commit
				awaited = yes
				res = await res

			if res === false
				break

		imba.commit() if commit
		@currentEvents.delete(event)
		if @currentEvents.size == 0
			@emit(:idle)
		# what if the result is a promise
		return
