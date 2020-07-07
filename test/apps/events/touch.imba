
css .section d:block bg:white pos:relative border:1px solid red
	top:2vh left:2vw w:96vw h:86vh
	
css .item d:block pos:relative w:50px h:50px bg:teal3 m:1 radius:sm

css .square d:block bg:white pos:relative size:200px
# css .box pos:absolute inset:25px bg:white shadow:inset 0 0 0 1px gray4/50
css .thumb pos:absolute l:-2 t:-2 d:block size:4 bg:blue7 radius:sm

css .box t:0 l:0 d:block pos:absolute fs:15px w:2em h:2em radius:sm
	bg:teal4/60 @touch:teal4/70 @move:green4/80

css .handle d:block pos:absolute w:10px h:10px l:10px t:10px bg:blue6 radius:sm
css .area d:flex pos:relative m:4 size:140px shadow:inset 0 0 0 1px gray6/50 jc:center ai:center

tag Draggable
	prop x = 0
	prop y = 0
	
	def render
		<self[x:{x} y:{y}].item> "drag me"

const config = {
	container: '.area'
	frame: ''
	scale: [0,100]
}

const dpr = window.devicePixelRatio

tag Paint
	prop size = 148
	
	def draw e
		let path = e.path ||= new Path2D
		path.lineTo(e.offsetX * dpr,e.offsetY * dpr)
		$canvas.getContext('2d').stroke(path)

	def render
		<self[d:block overflow:hidden bg:blue2 pos:absolute inset:1px]>
			<canvas$canvas[size:{size}px] width=size*dpr height=size*dpr
				@touch=draw
			>

tag Area
	prop p1 = { x:10, y:10 }
	prop p2 = { x:10, y:20 }
	prop sized = {w: 100}
	prop r = {t:0,r:0,b:0,l:0}
	
	prop tpc = 0
	prop lpx = 0
	
	
	# css &>* d:block pos:absolute w:50px h:50px bg:teal3 m:1 radius:sm
	
	def dragging e,el=e.target
		el.style.transform = "translate({e.x}px,{e.y}px)"
		
	def upd e,obj
		console.log 'upd',e.x,e.y,e.elapsed
		sized.w = Math.abs(e.x)
		
	def brpos e
		console.log 'brpos',e,e.x,e.y
		r.r=e.x
		r.b=e.y
	
	def track e
		console.log 'touch',e.phase,e.x,e.y
	
	def render
		<self[d:flex flw:wrap jc:center ac:center]>
			# <div @touch=dragging(e)>
			<.area> <.box @touch.reframe('.area')=dragging(e)>
			<.area> <.box @touch.lock.pin.reframe('.area')=dragging(e)>
			<.area> <.box @touch.pin.reframe('.area').moved(10)=dragging(e)>
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).reframe('.area')=dragging(e)>
			
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).fit('.area',10)=dragging(e)> 'S10'
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).moved(10).fit('.area')=dragging(e)> 'D'
			
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).moved(4).fit('.area',10)=dragging(e)>
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).fit('.area',0,100%,10%)=dragging(e)>
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).fit('.area',0,100%,10%)=dragging(e)>
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).moved(4).fit('.area',10)=dragging(e)>
			
			<.area> <.box[ml:-1em mt:-1em] @touch.pin(0.5).fit('.area')=dragging(e)>
			
			<.area>
				<.box[bg.throttled:red3 bg.blue:blue3] @click.flag-blue> "B"

			<.area>
				"multiple scales"
				<.box[ml:-1em mt:-1em t:{tpc}% l:{lpx}px]
					@touch.pin(0.5).fit('.area',0,[100%,100],1)=(tpc=e.y,lpx=e.x,console.log(e))
				>
			<.area @touch.pin(0.5).moved(4).fit('.area',10)=dragging(e)> <.box[l:-1em t:-1em]>
			
			<.area> <.box[l:-1em t:-1em]
				@touch.pin(0.5).moved(4).fit('.area',10)=dragging(e)
			>
			# <.area> <.box[l:-1em t:-1em] @touch(anchor:0.5,threshold:4,fit:'.area',snap:10)=dragging(e)>
			# <.area> <.box[l:-1em t:-1em] @touch(
			# 	anchor:0.5
			# 	threshold:4
			# 	fit:'.area'
			# 	snap:10
			# )=dragging(e)>
			
			<$earea.area> <$ebox.box>
				<.handle @touch.pin($ebox).moved.reframe($earea)=dragging(e,$ebox)>
						
			<.area>
				"fit-op"
				<.box[l:-1em t:-2em] @touch.pin(0.5,1).fit('op')=dragging(e)>

			<.area> <.box[t:50% l:50% bg:orange3] @touch.frame(self)=dragging(e)>
			
			<.area>
				<$bs.box[pos:relative w:{sized.w}px] @touch.fit($bs,-100%,100%,2)=upd(e)>
		
			
			<.area>
				<$bs2.box[pos:relative w:{sized.w}px]>
					<.handle[l:100% ml:2] @touch.anchor($bs2,1,0.5).reframe($bs2,-100%,100%,2)=upd(e)>
			<$xa.area>
				<$bs3.box[w:auto h:auto t:{r.t}px r:{r.r}px b:{r.b}px l:{r.l}px]>
					<.handle[l:100% t:100%] @touch.anchor($bs3,1,1).reframe($xa,100%,0,1)=brpos(e)>
			
			<.area> <Paint>
			
imba.mount do <Area.section>
	
console.log 'here'