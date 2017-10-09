# imba$nolib=1

var Imba = require("../imba")

Imba.KEYMAP = {
	"8": 'backspace'
	"9": 'tab'
	"13": 'enter'
	"16": 'shift'
	"17": 'ctrl'
	"18": 'alt'
	"19": 'break'
	"20": 'caps'
	"27": 'esc'
	"32": 'space'
	"35": 'end'
	"36": 'home'
	"37": 'larr'
	"38": 'uarr'
	"39": 'rarr'
	"40": 'darr'
	"45": 'insert'
	"46": 'delete'
	"107": 'plus'
	"106": 'mult'
	"91": 'meta'
}

Imba.CHARMAP = {
	"%": 'modulo'
	"*": 'multiply'
	"+": 'add'
	"-": 'sub'
	"/": 'divide'
	".": 'dot'
}

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

	###
	should remove this alltogether?
	@deprecated
	###
	prop source

	### A {Boolean} indicating whether the event bubbles up or not ###
	prop bubble type: Boolean, chainable: yes

	prop responder

	def self.wrap e
		self.new(e)
	
	def initialize e
		event = e
		bubble = yes

	def type= type
		@type = type
		self

	###
	@return {String} The name of the event (case-insensitive)
	###
	def type
		@type || event:type

	def name
		@name ||= type.toLowerCase.replace(/\:/g,'')

	# mimc getset
	def bubble v
		if v != undefined
			self.bubble = v
			return self
		return @bubble

	###
	Prevents further propagation of the current event.
	@return {self}
	###
	def halt
		bubble = no
		self


	def stopPropagation
		halt

	###
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.
	@return {self}
	###
	def cancel
		event.preventDefault if event:preventDefault
		@cancel = yes
		self

	def preventDefault
		cancel

	def silence
		@silenced = yes
		self

	def isSilenced
		!!@silenced

	###
	Indicates whether or not event.cancel has been called.

	@return {Boolean}
	###
	def isPrevented
		event and event:defaultPrevented or @cancel

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

	###
	Get the normalized character for KeyboardEvent/TextEvent
	@return {String}
	###
	def keychar
		if event isa KeyboardEvent
			var ki = event:keyIdentifier or event:key
			var sym = Imba.KEYMAP[event:keyCode]

			if !sym 
				if ki.substr(0,2) == "U+"
					sym = String.fromCharCode(parseInt(ki.substr(2), 16))
				else
					sym = ki
			return sym

		elif event isa (window.TextEvent or window.InputEvent)
			return event:data

		return null

	###
	@deprecated
	###
	def keycombo
		return unless var sym = keychar
		sym = Imba.CHARMAP[sym] or sym
		var combo = [], e = event
		combo.push(:ctrl) if e:ctrlKey
		combo.push(:shift) if e:shiftKey
		combo.push(:alt) if e:altKey
		combo.push(:cmd) if e:metaKey
		combo.push(sym)
		combo.join("_").toLowerCase


	def process
		var meth = "on{@prefix or ''}{name}"
		var args = null
		var domtarget = event:_target or event:target		
		# var node = <{domtarget:_responder or domtarget}>
		# need to clean up and document this behaviour

		var domnode = domtarget:_responder or domtarget
		# @todo need to stop infinite redirect-rules here

		while domnode
			@redirect = null
			if var node = tag(domnode) # not only tag 

				# FIXME No longer used? 
				if node[meth] isa String
					# should remember the receiver of the event
					meth = node[meth]
					continue # should not continue?

				if node[meth] isa Array
					args = node[meth].concat(node)
					meth = args.shift
					continue # should not continue?

				if node[meth] isa Function
					@responder ||= node
					# should autostop bubble here?
					args ? node[meth].apply(node,args) : node[meth](self,data)

				if node:onevent
					node.onevent(self)
					
			# add node.nextEventResponder as a separate method here?
			unless bubble and domnode = (@redirect or (node ? node.parent : domnode:parentNode))
				break

		processed
		return self


	def processed
		if !@silenced and @responder
			# if there has been inserts/removals during
			# theprocessing of this event - schedule Imba.commit
			if Imba.TagManager.changes
				Imba.ticker.schedule

			Imba.emit(Imba,'event',[self])
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

