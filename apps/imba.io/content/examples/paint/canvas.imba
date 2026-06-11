tag app-canvas
	dpr = window.devicePixelRatio
	state = {}

	def draw e
		let path = e.#path ||= new Path2D
		let ctx = $canvas.getContext('2d')
		path.lineTo(e.x * dpr,e.y * dpr)
		ctx.lineWidth = state.stroke * dpr
		ctx.strokeStyle = state.color
		ctx.stroke(path)
	
	def resized e
		$canvas.width = offsetWidth * dpr
		$canvas.height = offsetHeight * dpr

	<self @resize=resized @touch.prevent.moved.fit(self)=draw>
		<canvas$canvas[pos:abs w:100% h:100%]>