import {relativeRect,rectAnchor} from './app-arrow'

###
Annotation comments work with the following format

# ~ PATTERN | FLAGS , TX,TY,TZ,BX,BY,BW,FX,FY / ... ~ comment

All x coordinates 1 = 1ex
All t coordinates 1 = 1lh
###

const FLAGS = {
	INLINE: 1
	MARGIN: 2
	ABOVE: 4
	BELOW: 8
	RELUNIT: 16
}

const modes = ['lg','sm']

tag app-popover
	frame # Outer bounds of the code block

	css self
		d:block c:green4 t:0 l:0 pos:abs w:0 h:0
		transform-style: preserve-3d
		transform-origin: 0% 0%

		$base size:4 rd:full bg:green3/15 d:none
		div transform-style: preserve-3d pos:abs t:0 l:0

		$line h:0px w:100px pos:abs t:0 l:0
			transform-origin:0% 50%
			$lend pos:abs l:100% transform-origin:50% 50%
				
		$end pos:abs t:0 l:0
		svg pos:abs t:0 l:0px transform:translate(0%,-50%)
		path fill:none stroke:green4 stroke-width:1px
			stroke-linecap:round
			stroke-dasharray:3px 4px
		$p1 stroke:green6/40
			# stroke-width:3px
			stroke-dashoffset: 4px
		$p2 stroke:green4

		.box rd:lg pos:abs
			t:0 l:0 p:2 d:flex ja:center
			transform: translate3d(-50%,-50%,0px)
			ff:notes fw:400 fs:sm/1 ta:center ws:nowrap
			# ts:0px 0px 4px black
			# bg:cooler7/60
			# bg:green4/20 

		&.outside
			.box ws:normal ts:none c:green7 fs:md/1
			c:green7
			$p2 stroke:green5

		&.off
			visibility:hidden pe:none
			.box visibility:hidden pe:none
	
	css .debug &
		.box pe:auto
		.box @hover outline:1px dashed red
	
	def setup
		target = frame.querySelector(data.sel)
		rot = {x: 0, y: 0}
		bow = (Math.random! * 0.8 + 0.2)
		mode = null
		# flags.toggle('outside',data.mask & FLAGS.OUTSIDE)
		# rot = Math.random! * 360

	def serialize
		let r = do $1.toFixed(1).replace('.0','') # Math.round($1.toFixed(1).replace('.0',''))
		let layouts = modes.map do(m)
			let d = data[m]
			d ? "{d.mask},{r d.tx},{r d.ty},{r d.tz},{d.bw or ''},{r d.bax},{r d.bay},{r d.fx},{r d.fy}" : "-"

		"# ~{data.pattern}|{layouts.join('/')}~ {data.text}"

	get dims
		data[mode or frame.tipMode] or data.lg

	def reframing t
		console.log 'touch',t

	def relayout e
		# log 'relayout',target,e..type
		let dims = dims
		# log 'relayout',dims
		let op = offsetParent
		if target and dims.ty != undefined and op
			try
				let unitBox = self.frame..$anchor
				let xunit = unitBox ? unitBox.cachedWidth : 1
				let yunit = unitBox ? unitBox.cachedHeight : 1

				let frame = offsetParent.getBoundingClientRect!
				let rel = relativeRect(frame,target.getBoundingClientRect!)
				let lgutter = frame.left
				let active = yes
				unless dims.mask & FLAGS.RELUNIT
					dims.tx = dims.tx / xunit
					dims.ty = dims.ty / xunit
					dims.mask |= FLAGS.RELUNIT

				let tax = (dims.bax / 100)
				let tay = (dims.bay / 100)

				let x = dims.tx * xunit
				let y = dims.ty * yunit
				let z = dims.tz


				let ft = target.offsetTop
				let fl = target.offsetLeft

				let fromX = fl + dims.fx * xunit
				let fromY = ft + dims.fy * xunit

				let absToX = fromX + x
				let absToY = fromY + y

				flags.toggle('outside',absToX < 20 or absToY < 20)

				let xylen = Math.sqrt(x * x + y * y)
				let h = Math.ceil(Math.sqrt(xylen * xylen + z * z))

				let rot = Math.atan2(y,x) * 180 / Math.PI
				let yrot = Math.asin(z / h) * 180 / Math.PI
				let bow = bow
				let boxw = $end.offsetWidth

				if y < 0 or x < 0
					bow = -bow

				let svgh = Math.round(Math.max(30,h * 0.25))
				let hy = Math.round(svgh * 0.5)
				let d = "M10,{hy} Q{h / 2},{hy + bow * hy} {h - 3},{hy}"
				$svg.setAttribute('width',h)
				$svg.setAttribute('height',svgh)
				$p1.setAttribute('d',d)
				$p2.setAttribute('d',d)
				$base.style.width = (rel.width)px

				style.transform = "translate3d({fromX}px,{fromY}px,0px)"

				$line.style.transform = "translateZ(1px) rotate({rot}deg) rotateY({-yrot}deg)"
				$box.style.transform = "translate({tax * -100}%,{tay * -100}%)"
	
				# $end.style.transform = "translate({ax}%,-50%) translate3d({x}px,{y}px,{z}px)"
				$end.style.transform = "translate3d({x}px,{y}px,{z}px)"

				$line.style.width = h + 'px'

				let margin? = dims.mask & FLAGS.MARGIN
				let left? = rel.left + x < 0
				let above? = rel.top + y < 0
				let below? = rel.top + y > frame.height

				# log rel.top,y,frame.height
				if dims.bw
					$box.style.width = dims.bw + 'ex'
					$box.style.whiteSpace = 'initial'

				# flags.toggle('left',left?)
				# flags.toggle('above',y )
				# flags.toggle('below',above?)
				# flags.toggle('margin',margin?)
				# flags.toggle('inline',dims.mask & FLAGS.INLINE)
				flags.toggle('off',!active and !window.debug)

			catch e
				log 'error in relayout?!?',e
		
		if e..type == 'pointerup'
			frame.printAnnotations!
		self

	def mount
		relayout!

	def removeMode m
		delete data[m]
		log serialize!
	
	def setMode m
		log 'setMode',m
		unless data[m]
			data[m] = JSON.parse(JSON.stringify(dims))
		mode = m

	def render
		<self>
			# the ring / base item there 
			<div$base>
			<div$line>
				<svg$svg height=30>
					<path$p1 d="M 10 50 Q 50 10 90 50">
					<path$p2 d="M 10 50 Q 50 10 90 50">
				# <div$lend.box
				# 	@touch.meta.sync(rot)=relayout
				# 	> '' # data.text
			<div$end
				>
					<$box.box>
						if window.debug
							<span
								@touch.meta.stop.reframe('.overlays',0,1,0.25).sync(dims,'fx','fy')=relayout
								@touch.alt.stop.reframe($box,100,0,1).sync(dims,'bax','bay')=relayout
								@touch.reframe('.overlays',0,1,0.25).sync(dims,'tx','ty')=relayout
								# @touch.reframe('.overlays',0,1,0.25)=reframing
								> data.text
							<div$debug[pe:auto pos:abs mt:-1lh l:50% fs:9px/1.2 ff:sans fw:400 c:white d:hflex ts:none x:-50% z:10px bg:black/70]>
								css span d:block ws:nowrap c@hover:blue3 px:0.5 rd:xs h:1lh
								<span[ws:nowrap d:flex]> for m in modes
									<span 
										@click.meta.stop=removeMode(m) 
										@click.stop=setMode(m) 
										[o:0.3]=(!data[m])
										[bg:green4]=(mode == m)
										> m
								<span @touch.round.sync(dims,'ox2','tz')=relayout> "{dims.tz}"
								<span @touch.round.sync(dims,'bw')=relayout> "{dims.bw}ex"
								# <span @touch.round.sync(dims,'ox2','tz')=relayout> "{dims.tx},{dims.ty},{dims.tz}"
								# <span @touch.round.sync(dims,'bax','bay')=relayout> "a {dims.bax},{dims.bay}"
								# <span @touch.reframe('.overlays',0,1,0.25).sync(dims,'fx','fy')=relayout> "{dims.fx},{dims.fy}"
								
						else
							<span[ff:notes]> data.text

			# add debug box showing details