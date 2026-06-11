# [preview=lg]

# ---
tag Marquis
	def handle t
		x = t.x0 + Math.min(t.dx,0)
		y = t.y0 + Math.min(t.dy,0)
		w = Math.abs(t.dx)
		h = Math.abs(t.dy)
	<self[inset:0 of:hidden]@touch.flag('drag').reframe(self)=handle>
		<[x:{x}px y:{y}px w:{w}px h:{h}px]>
			css bg:blue3/10 bd:blue4 o:0 ..drag:1

tag App
	<self>
		<[inset:0 d:flex ja:center]> "Click and drag"
		<Marquis>
# ---

imba.mount <App>
