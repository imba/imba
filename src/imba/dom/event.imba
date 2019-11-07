# imba$v2=0

var Imba = require("../imba")

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
}

var el = Imba.Tag:prototype
def el.stopModifier e do e.stop || true
def el.preventModifier e do e.prevent || true
def el.silenceModifier e do e.silence || true
def el.bubbleModifier e do e.bubble(yes) || true
def el.ctrlModifier e do e.event:ctrlKey == true
def el.altModifier e do e.event:altKey == true
def el.shiftModifier e do e.event:shiftKey == true
def el.metaModifier e do e.event:metaKey == true
def el.keyModifier key, e do e.keyCode ? (e.keyCode == key) : true
def el.delModifier e do e.keyCode ? (e.keyCode == 8 or e.keyCode == 46) : true
def el.selfModifier e do e.event:target == @dom
def el.leftModifier e do e.button != undefined ? (e.button === 0) : el.keyModifier(37,e)
def el.rightModifier e do e.button != undefined ? (e.button === 2) : el.keyModifier(39,e)
def el.middleModifier e do e.button != undefined ? (e.button === 1) : true
	
def el.getHandler str, event
	if self[str]
		return self
	if @owner_ and @owner_:getHandler
		return @owner_.getHandler(str,event)

###
Imba handles all events in the dom through a single manager,
listening at the root of your document. If Imba finds a tag
that listens to a certain event, the event will be wrapped 
in an `Imba.Event`, which normalizes some of the quirks and 
browser differences.

@iname event
###
class Imba.Event

	### reference to the native event ###
	prop event

	prop prefix
	
	prop source

	prop data

	prop responder

	def self.wrap e
		self.new(e)
	
	def initialize e
		event = e
		@bubble = yes

	def type= type
		@type = type
		self

	###
	@return {String} The name of the event (case-insensitive)
	###
	def type do @type || event:type
	def native do @event

	def name
		@name ||= type.toLowerCase.replace(/\:/g,'')

	# mimc getset
	def bubble v
		if v != undefined
			self.bubble = v
			return self
		return @bubble

	def bubble= v
		@bubble = v

	###
	Prevents further propagation of the current event.
	@return {self}
	###
	def stop
		bubble = no
		self

	def stopPropagation do stop
	def halt do stop

	# migrate from cancel to prevent
	def prevent
		if event:preventDefault
			event.preventDefault
		else
			event:defaultPrevented = yes
		self:defaultPrevented = yes
		self

	def preventDefault
		console.warn "Event#preventDefault is deprecated - use Event#prevent"
		prevent

	###
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	###
	def isPrevented
		event and event:defaultPrevented

	###
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	###
	def cancel
		console.warn "Event#cancel is deprecated - use Event#prevent"
		prevent

	def silence
		@silenced = yes
		self

	def isSilenced
		!!@silenced

	###
	A reference to the initial target of the event.
	###
	def target
		tag(event:_target or event:target)

	###
	A reference to the object responding to the event.
	###
	def responder
		@responder

	###
	Redirect the event to new target
	###
	def redirect node
		@redirect = node
		self
		
	def processHandlers node, handlers
		let i = 1
		let l = handlers:length
		let bubble = @bubble
		let state = handlers:state ||= {}
		let result 
		
		if bubble
			@bubble = 1

		while i < l
			let isMod = false
			let handler = handlers[i++]
			let params  = null
			let context = node
			let checkSpecial = false
			
			if handler isa Array
				params = handler.slice(1)
				checkSpecial = yes
				handler = handler[0]
			
			if typeof handler == 'string'
				if keyCodes[handler]
					params = [keyCodes[handler]]
					handler = 'key'
					
				let mod = handler + 'Modifier'

				if node[mod]
					isMod = yes
					params = (params or []).concat([self,state])
					handler = node[mod]
			
			# if it is still a string - call getHandler on
			# ancestor of node to see if we get a handler for this name
			if typeof handler == 'string'
				let el = node
				let fn = null
				let ctx = state:context
	
				if ctx
					if ctx:getHandler isa Function
						ctx = ctx.getHandler(handler,self)
					
					if ctx[handler] isa Function
						handler = fn = ctx[handler]
						context = ctx

				unless fn
					console.warn "event {type}: could not find '{handler}' in context",ctx

				# while el and (!fn or !(fn isa Function))
				# 	if fn = el.getHandler(handler)
				# 		if fn[handler] isa Function
				# 			handler = fn[handler]
				# 			context = fn
				# 		elif fn isa Function
				# 			handler = fn
				# 			context = el
				# 	else
				# 		el = el.parent
					
			if handler isa Function
				# what if we actually call stop inside function?
				# do we still want to continue the chain?

				# loop through special variables from params?

				if checkSpecial
					# replacing special params
					for param,i in params
						if typeof param == 'string' && param[0] == '~' && param[1] == '$'
							let name = param.slice(2)
							if name == 'event'
								params[i] = self
							elif self[name] isa Function
								params[i] = self[name]()
							elif node[name] isa Function
								params[i] = node[name]()
							else
								console.warn("Missing special handler ${name}")

				let res = handler.apply(context,params or [self])

				if !isMod
					@responder ||= node

				if res == false
					# console.log "returned false - breaking"
					break

				if res and !@silenced and res:then isa Function
					res.then(Imba:commit)
		
		# if we havent stopped or dealt with bubble while handling
		if @bubble === 1
			@bubble = bubble

		return null

	def process
		var name = self.name
		var meth = "on{@prefix or ''}{name}"
		var args = null
		var domtarget = event:_target or event:target		
		var domnode = domtarget:_responder or domtarget
		# @todo need to stop infinite redirect-rules here
		var result
		var handlers

		while domnode
			@redirect = null
			let node = domnode.@dom ? domnode : domnode.@tag

			if node
				if handlers = node:_on_
					for handler in handlers when handler
						let hname = handler[0]
						if name == handler[0] and bubble
							processHandlers(node,handler)
					break unless bubble

				if bubble and node[meth] isa Function
					@responder ||= node
					@silenced = no
					result = args ? node[meth].apply(node,args) : node[meth](self,data)

				if node:onevent
					node.onevent(self)

			# add node.nextEventResponder as a separate method here?
			unless bubble and domnode = (@redirect or (node ? node.parent : domnode:parentNode))
				break

		processed

		# if a handler returns a promise, notify schedulers
		# about this after promise has finished processing
		if result and result:then isa Function
			result.then(self:processed.bind(self))
		return self


	def processed
		if !@silenced and @responder
			Imba.emit(Imba,'event',[self])
			Imba.commit(event)
		self

	###
	Return the x/left coordinate of the mouse / pointer for this event
	@return {Number} x coordinate of mouse / pointer for event
	###
	def x do native:x

	###
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	###
	def y do native:y
		
	def button do native:button
	def keyCode do native:keyCode
	def ctrl do native:ctrlKey
	def alt do native:altKey
	def shift do native:shiftKey
	def meta do native:metaKey
	def key do native:key

	###
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	###
	def which do event:which