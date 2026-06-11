import { getArrow,getBoxToBoxArrow } from "perfect-arrows"

const defaults = {
	bow: 0.1
	stretch: 0.02
	minStretch:0
	maxStretch:300
	padEnd: 0
	padStart: 10
	flip: false
	straights: true
}

tag arrow-debug

	def refresh
		let arrows = document.querySelectorAll('app-arrow')
		for arrow in allArrows
			arrow.render!
		self

	<self[pos:fixed t:200px l:0px zi:200 d:block] @change.silent=refresh>
		<div>
			<input type='range' min=0.0 step=0.01 max=1 bind=defaults.bow>
			<span> defaults.bow
		<div>
			<input type='range' min=0.0 step=0.01 max=1 bind=defaults.stretch>
			<span> defaults.stretch
		<div>
			<input type='range' min=0.0 step=0.01 max=400 bind=defaults.minStretch>
			<span> defaults.minStretch
		<div>
			<input type='range' min=0.0 step=0.01 max=400 bind=defaults.maxStretch>
			<span> defaults.maxStretch
		<div>
			<input type='range' min=0.0 step=0.01 max=30 bind=defaults.padStart>
			<span> defaults.padStart
		<div>
			<input type='range' min=0.0 step=0.01 max=30 bind=defaults.padEnd>
			<span> defaults.padEnd
		<div>
			<input type='checkbox' bind=defaults.flip>
			<span> defaults.flip
		<div>
			<input type='checkbox' bind=defaults.straights>
			<span> defaults.straights

# imba.mount <arrow-debug>

def rotate cx, cy, x, y, rad
	# let radians = (Math.PI / 180) * angle
	let cos = Math.cos(rad)
	let sin = Math.sin(rad)
	let nx = (cos * (x - cx)) + (sin * (y - cy)) + cx
	let ny = (cos * (y - cy)) - (sin * (x - cx)) + cy
	return [nx, ny]

export def calculateConnector from,to,o = defaults
	from = from.getBoundingClientRect! if from isa Element
	to = to.getBoundingClientRect! if to isa Element

	if from.width == 0 and to.width == 0
		return getArrow(from.left,from.top,to.left,to.top,o)

	let arrow = getBoxToBoxArrow(
		from.left,from.top,from.width,from.height,
		to.left,to.top,to.width,to.height,o
	)
	return arrow

export def normalizeConnector arrow
	let [sx,sy,cx,cy,ex,ey,endrad,startrad,midrad] = arrow
	let out = {x: sx, y: sy}
	# offset all points to make x the center
	ex -= sx
	ey -= sy
	cx -= sx
	cy -= sy
	sx = sy = 0

	let angle = Math.atan2(ey,ex)
	[ex,ey] = rotate(0,0,ex,ey,angle)
	[cx,cy] = rotate(0,0,cx,cy,angle)
	
	let w = out.width = Math.round(ex) + 20
	let h = out.height = Math.round(Math.abs(cy) * 2) + 20
	let oy = (h - 20) / 2

	let d = out.path = `M{sx},{sy} Q{cx},{cy} {ex},{ey}`
	out.end = "translate({ex},{ey}) rotate({(endrad - angle) * (180 / Math.PI)})"
	out.start = "translate({sx},{sy}) rotate({(startrad - angle) * (180 / Math.PI)})"
	out.transform = "translate({out.x - 10}px,{out.y}px) translateY(-50%) scale(var(--scale,1))"
	out.angle = angle

	return out

export def relativeRect frame, rect
	let l = rect.left - frame.left
	let t = rect.top - frame.top
	return {
		left: l,
		top: t,
		right: l + rect.width,
		bottom: t + rect.height,
		y: t + rect.height * 0.5
		x: l + rect.width * 0.5
		width: rect.width,
		height: rect.height
	}

export def rectAnchor rect, ax = 0.5, ay = 0.5
	let x = rect.left + rect.width * ax
	let y = rect.top + rect.height * ay

	return {
		left: x
		top: y,
		right: x,
		bottom: y
		y: x
		x: y
		width: 0,
		height: 0
	}


tag app-arrow
	from
	to

	css @before test
		d:block
		content: " "
		size:1px
		bg:red4
		rd:full
		# t:-5px
		# l:-5px
		pos:absolute

	def serialize
		let origin = frame.$anchor
		let orect = origin.getBoundingClientRect!
		let style = window.getComputedStyle(origin)
		let wu = parseFloat(orect.width)
		let hu = parseFloat(orect.height)
		let box = to.getBoundingClientRect!

		let ox = Math.round(box.left - orect.left) / wu
		let oy = Math.round(box.top - orect.top) / hu
		return "0,{ox.toFixed(1)},{oy.toFixed(1)}"


		let computed = window.getComputedStyle(from)

		let frame = frame.getBoundingClientRect!

		let lh = parseFloat(computed.lineHeight)
		let rect0 = relativeRect(frame,from.getBoundingClientRect!)
		let rect1 = relativeRect(frame,to.getBoundingClientRect!)
		let ox2 = Math.round ((rect1.x - rect0.x) / lh) * 100
		let oy2 = Math.round ((rect1.y - rect0.y) / lh) * 100
		# log rect0,rect1,computed,lh
		"0,{ox},{oy}"

	def render
		return unless offsetParent and from and to
		
		let rect0 = from.getBoundingClientRect!
		let rect1 = to.getBoundingClientRect!

		if frame
			let offset = frame.getBoundingClientRect!
			rect0 = relativeRect(offset,rect0) 
			rect1 = relativeRect(offset,rect1)
			let dx = rect1.x - rect0.x
			let dy = rect1.y - rect0.y
			let ar = Math.abs(dx / dy)
			# console.log dx,dy,ar
			if ar > 3 and false
				rect0 = rectAnchor(rect0,dx > 0 ? 1 : 0,0.5)
				rect1 = rectAnchor(rect1,dx > 0 ? 0 : 1,0.5)

		# let arrow = getArrow(from.left,from.top,to.left,to.top,o)
		# let arrow = calculateConnector(rectAnchor(rect0),rectAnchor(rect1))
		rect0 = rectAnchor(rect0)
		let arrow = calculateConnector(rect0,rect1)
		let norm = normalizeConnector(arrow)

		<self[d:block pos:abs t:{norm.y}px l:{norm.x}px rotate:{norm.angle}rad]>

			<svg$straight[pos:abs t:0 l:-10px pe:none origin:10px 50%]
				css:transform="scale(var(--scale,1)) rotate(calc((1 - var(--scale,1)) * 20deg))"
				css:top="{norm.height * -0.5}px"
				width=norm.width
				height=norm.height
				>
				<g transform="translate(10,{norm.height / 2})">
					<svg:path$p fill="none" d=norm.path>
					<svg:polygon$end points="0,-3 6,0, 0,3" transform=norm.end>
					<svg:polygon$start points="0,-3 6,0, 0,3" transform=norm.start>

tag Point
	x = 0
	y = 0

	<self[x:{x}px y:{y}px] @touch.sync(self)>

tag App

	def mount
		render!
		refresh!

	def refresh
		let arrow = calculateConnector($a,$b)
		log arrow

	<self>
		css .point pos:absolute size:10px bg:red4 rd:full
		<Point$a.point[l:100px t:50px]>
		<Point$b.point[l:200px t:80px]>
		<app-arrow from=$a to=$b>


# imba.mount <App>