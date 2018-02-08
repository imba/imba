var Imba = require("../imba")

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
	# left: 37,
	# right: 39,
	
}

var checkKeycode = do $1:keyCode ? ($1:keyCode !== $3) : false

# return true to skip handler
export var Modifiers =
	halt:    do this.stopPropagation and false
	stop:    do this.stopPropagation and false
	prevent: do this.preventDefault and false
	silence: do this.silence and false
	self:    do $1:target != $2.@dom
	left:    do $1:button != undefined ? ($1:button !== 0) : checkKeycode($1,$2,keyCodes:left)
	right:   do $1:button != undefined ? ($1:button !== 2) : checkKeycode($1,$2,keyCodes:right)
	middle:  do $1:button != undefined ? ($1:button !== 1) : false
	ctrl:    do $1:ctrlKey != true
	shift:   do $1:shiftKey != true
	alt:     do $1:altKey != true
	meta:    do $1:metaKey != true
	keycode: do $1:keyCode ? ($1:keyCode !== $3) : false
	del:     do $1:keyCode ? ($1:keyCode !== 8 and $1:keyCode !== 46) : false
	data:    do ($4:data = yes) and false
	bubble:  do ($4:bubble = yes) and false
		

var el = Imba.Tag:prototype
	
def el.on$stop e do e.stop || true
def el.on$prevent e do e.prevent || true
def el.on$silence e do e.silence || true
def el.on$bubble e do e.bubble(yes) || true
def el.on$ctrl e do e.event:ctrlKey == true
def el.on$alt e do e.event:altKey == true
def el.on$shift e do e.event:shiftKey == true
def el.on$meta e do e.event:metaKey == true
def el.on$key key, e do e.keyCode ? (e.keyCode == key) : true
def el.on$del e do e.keyCode ? (e.keyCode == 8 or e.keyCode == 46) : true
def el.on$self e do e.event:target == @dom
def el.on$left e do e.button != undefined ? (e.button === 0) : el.on$key(37,e)
def el.on$right e do e.button != undefined ? (e.button === 2) : el.on$key(39,e)
def el.on$middle e do e.button != undefined ? (e.button === 1) : true

def el.getHandler str
	self[str] # or (parent?.getHandler(str))

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

	### reference to the native event ###
	prop prefix

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
	def type
		@type || event:type
	
	def button do event:button
	def keyCode do event:keyCode

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
		return self

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
		event and event:defaultPrevented or @cancel

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
		let result 
		
		if bubble
			@bubble = 1

		while i < l
			let isMod = false
			let handler = handlers[i++]
			let params  = null
			let context = node
			
			if handler isa Array
				params = handler.slice(1)
				handler = handler[0]
			
			if typeof handler == 'string'
				if keyCodes[handler]
					handler = 'key'
					params = [keyCodes[handler]]
					
				let mod = "on$" + handler

				if node[mod]
					isMod = yes
					params.push(self) if params
					handler = node[mod]
			
			# if it is still a string - call getHandler on
			# ancestor of node to see if we get a handler for this name
			if typeof handler == 'string'
				let el = node
				let fn = null
				while el and (!fn or !(fn isa Function))
					if fn = el.getHandler(handler)
						handler = fn
						context = el
					else
						el = el.parent
					
			if handler isa Function
				# what if we actually call stop inside function?
				# do we still want to continue the chain?
				let res = handler.apply(context,params or [self])
				
				# should we take awaits into account?
				# was bubbling before - has not been modified
				if !isMod
					bubble = no # stop propagation by default
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
		
		# loop through the handlers
		
	def processHandler node, name, handler # , mods = []

		# go through 
		let modIndex = name.indexOf('.')
		
		var o = {}
		
		if modIndex >= 0
			# could be optimized
			let mods = name.split(".").slice(1)
			# go through modifiers
			for mod in mods
				let guard = Modifiers[mod]
				unless guard
					if keyCodes[mod]
						mod = keyCodes[mod]
					if /^\d+$/.test(mod)
						mod = parseInt(mod)
						guard = Modifiers:keycode
					else
						console.warn "{mod} is not a valid event-modifier"
						continue
				
				# skipping this handler?
				if guard.call(self,event,node,mod,o) == true
					return

		var context = node
		var params = [self,data]
		var result
		
		if handler isa Array
			params = handler.slice(1)
			handler = handler[0]
		
		if o:data
			let el = node
			while el
				if el.@data
					params = [el.@data]
					break
				el = el.parent

		if handler isa String
			let el = node
			while el					
				# should lookup actions?
				if el[handler]
					context = el
					handler = el[handler]
					break
				
				if el.@data and el.@data[handler] isa Function
					context = el.@data
					handler = el.@data[handler]
					break
					
				el = el.parent
		
		if handler isa Function
			@silenced = no
			result = handler.apply(context,params)
		
		# the default behaviour is that if a handler actually
		# processes the event - we stop propagation. That's usually
		# what you would want
		if !o:bubble
			stopPropagation
		
		@responder ||= node
		
		# if result is a promise and we're not silenced, schedule Imba.commit
		if result and !@silenced and result:then isa Function
			result.then(Imba:commit)

		return result

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
				if node[meth] isa Function
					@responder ||= node
					@silenced = no
					result = args ? node[meth].apply(node,args) : node[meth](self,data)

				if handlers = node:_on_
					for handler in handlers when handler
						let hname = handler[0]
						if name == handler[0] and bubble # and (hname:length == name:length or hname[name:length] == '.')
							processHandlers(node,handler)
					break unless bubble

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
	def x do event:x

	###
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	###
	def y do event:y

	###
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	###
	def which do event:which

