### css scoped
draggable-component {
	display: block;
    position: relative;
}
###

tag draggable-component

	def pointerdown e
		console.log('pointer!',e,e.pressure,e.pointerId,@nr)
		# pointerdrag
		@setPointerCapture(e.pointerId)
		@pointer =
			id: e.pointerId
			x: e.x - parseInt(@style.left or 0)
			y: e.y - parseInt(@style.top or 0)

	def pointermove e
		if e.pressure
			let dx = e.x - @pointer.x
			let dy = e.y - @pointer.y
			console.log('pointer move!',e.pressure,e.pointerId,@nr,e,dx,dy)
			@style.left = dx + 'px'
			@style.top = dy + 'px'


	def pointerup e
		console.log('pointer move!',e.pressure,e.pointerId,@nr)

	def log ...params
		console.log(*params)

	def render
		<self
			:pointerdown.pointerdown
			:pointermove.pointermove
			:pointerup.log($type,$pointerId)
			:lostpointercapture.log($type,$pointerId)
			:gotpointercapture.log($type,$pointerId)
		>
			<div> "I am draggable"
			<slot>

tag app-root

	def render
		<self>
			<h2> "Draggable items"
			<draggable-component nr=1> "Dragone"
			<draggable-component nr=2> "Dragtwo"


imba.mount <app-root>