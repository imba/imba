
css .section d:block pos:relative border:1px solid red
	top:10vh left:10vw w:80vw h:80vh
css .item d:block pos:relative w:30px h:30px bg:teal3 m:1

css .square d:block bg:white pos:relative size:200px
css .box pos:absolute inset:25px bg:white shadow:inset 0 0 0 1px gray4/50
css .thumb pos:absolute l:-2 t:-2 d:block size:4 bg:blue7 radius:sm
	
tag Something
	
	def render
		<self>
			<div @touch.hold(100)>

tag Draggable
	prop step = 1
	def move e
		top = e.touch.y
		left = e.touch.x
	
	def render
		<self[t:{top}% l:{left}%].item @touch.transform(parentNode,0,100,step)=move> "I"
		
tag DraggableSync
	prop step = 1
	prop pos = { x:10, y:10 }

	def render
		<self[t:{pos.y}% l:{pos.x}%].item
			@touch.transform(parentNode,0,100,step).sync(pos)> "S"

tag Slider
	prop min = 0
	prop max = 100
	prop step = 1
	prop value = 0
	
	css .track h:2 w:100% bg:blue3 pos:relative radius:sm
	css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% radius:sm
	
	def update e
		value = Math.min(max,Math.max(e.touch.x,min))

	def render
		<self @touch.transform(self,min,max,step)=update>
			<$track.track> <.thumb[l:{100 * (value - min) / (max - min)}%]>
			<span.value> value

tag MultiSlide
	prop min = 0
	prop max = 100
	prop step = 1
	prop value = [0,0]
	
	css d:block bg:white pos:relative size:10rem

	css $box
		pos:absolute inset:6 bg:white shadow:inset 0 0 0 1px gray4/50
	
	css $area
		pos:absolute border:1px dashed gray4 b:0 l:0 bg:gray4/20
		$thumb pos:absolute r:-2 t:-2 d:block size:4 bg:blue7 radius:sm
	
	def update e do value = [e.touch.x,e.touch.y]
	get l do 100 * (value[0] - min) / (max - min)
	get b do 100 * (value[1] - min) / (max - min)

	def render
		<self @touch.reframe($box,[min,max,step],[max,min,step]).clamp=update>
			<$box> <$area[h:{b}% w:{l}%]> <$thumb>
			<span.value> value.join(',')


tag DragTest
	prop clamp = yes
	prop step = 1
	prop x = 0
	prop y = 0

	def update e
		x = e.touch.x
		y = e.touch.y

	def render
		<self.square @touch.reframe($box,step).clamp(clamp)=update>
			<$box.box> <$thumb.thumb[x:{x} y:{y}]>
			<span.value> [title,x,y].join(',')
			
tag CenterDragTest
	prop clamp = yes
	prop step = 1
	prop x = 0
	prop y = 0

	def update e
		x = e.touch.x
		y = e.touch.y

	def render
		<self.square @touch.reframe($box,step).clamp(clamp)=update>
			<$box.box> <$thumb.thumb[x:{x} y:{y}]>
			<span.value> [title,x,y].join(',')


const dpr = window.devicePixelRatio

tag Paint
	prop size = 300

	def draw e
		let path = e.touch.path ||= new Path2D
		# $path = new Path2D if e.type == 'pointerdown'
		path.lineTo(e.offsetX * dpr,e.offsetY * dpr)
		$canvas.getContext('2d').stroke(path)

	def render
		<self[d:block overflow:hidden bg:white]>
			<canvas$canvas[size:{size}px]
				width=size*dpr
				height=size*dpr
				@touch.rel()=draw
			>

tag Options
	prop p1 = { x:10, y:10 }
	prop p2 = { x:10, y:20 }
	
	def dragging e
		let t = e.touch
		# e.x,e.y,
		console.log t.x,t.y,e.target
	
	def render
		<self>
			<div.item @touch.transform(self,0,1,0.1)=dragging> "%"
			<div.item @pointerdrag.rect(self).x(0,100,1)=dragging> "I"
			
			<Draggable.item>
			<Draggable.item step=10>
			<DraggableSync[pos:absolute].item>
			<DraggableSync[pos:absolute].item step=10>
			<div[x:{p1.x}px y:{p1.y}px].item @touch.reframe(self).sync(p1)> "H"
			<div[x:{p2.x}px y:{p2.y}px].item @touch.reframe(self).sync(p2)> "%"

			<Slider step=10>
			<Slider min=-20 max=20 step=2>
				
			<div[d:grid pa:center gtc:max-content max-content gap:4]>
				<MultiSlide step=10>
				<MultiSlide>
				<DragTest title='clamp'>
				<DragTest clamp=no step=4 title='unclamped'>
				<DragTest[w:300px] step=10% title='step 10%'>

			<Paint[border:gray4]>
			
			# transpose
			# <div @drag.transform(rect,x0,x1,y0,y1)>
			<div @touch.transform(rect,x0,x1,y0,y1)>
			# transform values to 0 - 1 based on 
			# <div @pointerdrag(target,container).hold(100)>
			
imba.mount do <Options.section>