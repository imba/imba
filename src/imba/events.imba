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

	def handleEvent event
		var target = event.target
		var parts = @params
		var i = 0
		let commit = yes # @params.length == 0

		# console.log 'handle event',event.type,@params

		for part,i in @params
			let handler = part
			let args = [event]
			let res
			let context = null

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
							args[i] = this[name]

						elif param[1] == '$'
							let target = event

							if name[0] == '$'
								target = target.detail
								name = name.slice(1)

							if name == ''
								args[i] = target
							else
								args[i] = target ? target[name] : null

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
				break unless target == event.currentTarget
			elif handler == 'once'
				event.currentTarget.removeEventListener(event.type,self)
			elif keyCodes[handler]
				unless keyCodes[handler].indexOf(event.keyCode) >= 0
					break

			elif typeof handler == 'string'
				if handler[0] == '@'
					handler = handler.slice(1)
					context = @closure

				elif handler == 'trigger'
					
					let name = args[0]
					let detail = args[1]
					let e = detail ? CustomEvent.new(name, bubbles: true, detail: detail) : Event.new(name)
					let customRes = event.currentTarget.dispatchEvent(e)

				else
					context = @getHandlerForMethod(event.currentTarget,handler)

			if context
				# commit = yes
				res = context[handler].apply(context,args)
			elif handler isa Function
				# commit = yes
				res = handler.apply(event.currentTarget,args)

		imba.commit() if commit
		# what if the result is a promise
		return
