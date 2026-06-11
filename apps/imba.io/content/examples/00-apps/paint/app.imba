const dpr = window.devicePixelRatio

tag app-paint
	size = 500
	
	def draw e
		let path = e.$path ||= new Path2D
		path.lineTo(e.x * dpr,e.y * dpr)
		$canvas.getContext('2d').stroke(path)

	def render
		<self[d:block overflow:hidden bg:blue1]>
			<canvas$canvas[size:{size}px]
				width=size*dpr height=size*dpr @touch.fit(self)=draw>

imba.mount <app-paint>
