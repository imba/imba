# imba$nolib=1

var Imba = require("../imba")

class Imba.Pointer

	prop phase
	prop prevEvent
	prop button
	prop event
	prop dirty
	prop events
	prop touch

	def initialize
		button = -1
		event = {x: 0, y: 0, type: 'uninitialized'}
		return self

	def update e
		event = e
		dirty = yes
		self

	# this is just for regular mouse now
	def process
		var e1 = event

		if dirty
			prevEvent = e1
			dirty = no

			# button should only change on mousedown etc
			if e1:type == 'mousedown'
				button = e1:button

				# do not create touch for right click
				if button == 2 or (touch and button != 0)
					return

				# cancel the previous touch
				touch.cancel if touch
				touch = Imba.Touch.new(e1,self)
				touch.mousedown(e1,e1)

			elif e1:type == 'mousemove'
				touch.mousemove(e1,e1) if touch

			elif e1:type == 'mouseup'
				button = -1

				if touch and touch.button == e1:button
					touch.mouseup(e1,e1)
					touch = null
				# trigger pointerup
		else
			touch.idle if touch
		self

	def x
		event:x

	def y
		event:y
	