import * as CODICONS from 'imba-codicons'
import * as sw from '../sw/controller'

import {fs} from '../store'

import './console'

class Demo
	constructor win
		win = win
	
	def commit
		win.$commit!

tag app-repl-preview
	set url val
		if #url =? val
			refresh! if $entered

	get url
		#url

	root
	w = 2000
	scale = 1
	size = 'auto-auto'
	mode
	file
	options = {}
	$win
	$doc
	demo
	exports
	src

	def build
		t0 = Date.now!

		$iframe = new <iframe[pos:absolute width:100% height:100% min-width:200px]>
		$iframe.src = 'about:blank'
		commands = []

		$iframe.replify = do(win)
			# console.log 'replify',win.ServiceSessionID,win.navigator.serviceWorker.controller
			$win = win # $iframe.contentWindow
			$doc = $win.document
			demo = new Demo(win)
			emit('loading',demo)

			# connect with the url as well
			win.addEventListener('routerinit') do(e)
				let r = e.detail

				r.on('change') do(e)
					if $address
						$address.value = r.path

				if options.route
					r.replace(options.route)

			win.expose = do(example)
				let keys = Object.keys(example)
				if keys.length
					self.exports = example

				demo.state = example.state
				demo.vars = example.vars
				emit('loaded',demo)

				let items = []
				for own key,value of (example.actions or example)
					if value isa win.Function
						items.push(name: key, exec: value)
				commands = items
				render!
				
				

			let {log,info} = win.console.log
			if $console
				$console.context = win
				$console.native = win.console
				$console.autoclear!
				win.console.log = $console.log.bind($console)
				win.console.info = $console.log.bind($console)
				# $console.clear!

		$iframe.onload = do
			return unless $refreshed
			# console.log 'iframe loaded after',Date.now! - t0
			try
				let element = $doc.querySelector('body :not(script)')
				flags.toggle('empty-preview',!element)

		if src
			$iframe.src = src

	def maximize
		flags.add('maximized')
		self

	def minimize
		flags.remove('maximized')

	get maximized?
		flags.contains('maximized')

	def toggle
		maximized? ? minimize! : maximize!
		reflow!
		render!

	def reflow e
		ow = $bounds.offsetWidth
		oh = $bounds.offsetHeight
		recalc!
		self

	def recalc
		let [w\any,h\any] = size.split('-')

		if w == 'auto' and h == 'auto'
			scale = sx = sy = 1
			iw = ih = '100%'
			return

		ow ||= ($bounds && $bounds.offsetWidth)
		oh ||= ($bounds && $bounds.offsetHeight)

		let gap = 0
		
		if ow < 240
			gap = 0
			w = 240
			h = 300

		flags.toggle('pip',ow < 240)

		if w == 'auto'
			scale = sx = sy = 1
			iw = ih = '100%'
		else
			w = parseInt(w)
			sx = scale = Math.min(1,(ow - gap) / w)
			iw = Math.floor(w)

		if h == 'auto'
			ih = Math.floor((oh - gap) / scale)
		else
			h = parseInt(h)
			sy = Math.min(1,(oh - gap) / h)
			ih = ((sy < sx) ? Math.floor(h * (sy/sx)) : h)
		self

	def resize e,dir
		$resizing = e
		
		if e.type == 'pointerup'
			flags.remove('resizing')
			$resizing = null
			if e.elapsed < 100
				return size = 'auto-auto'

		let t = e.data ||= {}

		unless t.sx
			flags.add('resizing')
			t.pip = !maximized?
			t.sx = sx
			t.sy = sy
			[t.rw,t.rh] = size.split('-')
			t.iw = $frame.offsetWidth
			t.ih = $frame.offsetHeight
			t.bw = $bounds.offsetWidth
			t.bh = $bounds.offsetHeight
			t.vw = window.innerWidth
			t.vh = window.innerHeight
			t.bounds = $bounds.getBoundingClientRect!

		let b = t.bounds
		let w = t.iw
		let h = t.ih

		let halfw = (b.width / 2)
		let halfh = (b.height / 2)

		let relx = (e.x - (b.left + halfw))
		let rely = (e.y - (b.top + halfh))
		let absx = Math.abs(relx)
		let absy = Math.abs(rely)

		let restw = 1440 - b.width
		let resth = 2000 - b.height

		if dir != 'y'
			t.rw = null
			if absx > halfw
				let gap = relx > 0 ? (t.vw - b.right) : b.left
				w = b.width + Math.min((absx - halfw) / gap,1) * restw
			else
				w = Math.max(absx * 2,260)

		if dir != 'x' and !t.pip
			t.rh = null
			if absy > halfh
				let gap = rely > 0 ? (t.vh - b.bottom) : b.top
				h = b.height + Math.min((absy - halfh) / gap,1) * resth
			else
				h = Math.max(absy * 2,260)

		size = "{t.rw == 'auto' ? t.rw : Math.round(w)}-{t.rh == 'auto' ? t.rh : Math.round(h)}"

	css d:flex fld:column pos:relative min-width:40px

	css $body pos:relative
	css $bounds pos:absolute w:100% h:100% r:0 b:0 min-width:120px
	css $frame
		pos:absolute top:0 l:0 bg:white w:100% h:100%
		border:1px solid gray3

	css $cover pos:absolute inset:0 cursor:zoom-in d:none

	css $controls pos:absolute b:100% r:0 py:1 w:100% d:flex jc:center opacity:0
	css self@hover $controls opacity:1

	css .btn p:1 fw:500 c:gray4 @hover:gray5 .checked:blue5 outline@focus:none pe.checked:none

	css @is-pip @not(.maximized)
		bg:clear
		$bounds max-height:200px
		$frame l:auto t:auto r:20px x:0 b:20px transform-origin:100% 100% y:0
		$cover d:block bg@hover:blue5/20
		$controls d:none

	css &.maximized
		$body pos:fixed zi:350 w:100vw h:100vh t:0 l:0 bg:gray2/85
		$bounds w:auto h:auto inset:14 b:20
		$controls pos:absolute t:auto b:0

	css .resizer
		pos:absolute
		fs:14px
		w:1em .y:100%
		h:1em .x:100%
		b:-1em .x:0
		r:-1em .y:0
		cursor: nwse-resize .x:ew-resize .y:ns-resize
		bg:clear @hover:gray5/10
		d:none
	
	css $console
		pos:relative

	def entered e
		# console.log 'entered',Date.now! - t0
		$entered = yes
		refresh! unless $refreshed

	def intersecting e
		console.log 'intersect',e
		$intersect = e
	
	def addIs e
		console.log 'intersect',e.ratio,e.isIntersecting
		$intersects ||= []
		$intersects.push(e)
	
	def mount
		url = options.url or root.replUrl

	def unmount
		$entered = $refreshed = no

	css .tools
		pos:absolute t:0 r:0 zi:100 bg:blue5 rd:md
		svg m:1 w:4 h:4 c:white
	
	css .body rd:inherit

	css .titlebar
		pos:relative rdt:md bg:gray3 d:hflex ai:center p:2 px:1 j:flex-end
		& + .body rdt:0
		.tool c:gray6 p:1 fw:500 us:none fs:sm
			svg w:3 h:3 c:gray5 stroke-width:3px
			@hover c:blue5 cursor:pointer
				svg c:blue5
		.cmd
			rd:md bg:gray1 px:1.5 py:0 c:gray7 tween:all 0.1s mx:1 bxs:xs
			@before content:"run " o:0.8 fw:400
			suffix:"()"
			@hover bg:white c:blue7 
			@active bg:gray1 bxs:outline
			

	def execCommand command
		if command.exec
			command.exec!
		return

	def render
		recalc!
		<self @intersect.silent.in=entered>
			css .cmd
				rd:md bg:gray1 px:1.5 py:0 c:gray7 tween:all 0.1s mx:1 bxs:xs suffix:"()"
				@before content:"run " o:0.8 fw:400
				@hover bg:white c:blue7 
				@active bg:gray1 bxs:outline

			if options.titlebar
				<.titlebar>
					css pos:relative rdt:md bg:gray2 d:hflex ai:center p:2 px:1 j:flex-end
						bd:gray3 bdb:gray2
					css & + .body rdt:0
					css input bg:white rd:md bd:gray3 px:2 fs:sm mx:1 fl:1 fw:400
						@focus bd:blue4 bxs:ring
					<.tool @click=rerun> <svg src=CODICONS.ARROW_LEFT>
					<.tool @click=rerun> <svg src=CODICONS.ARROW_RIGHT>
					<.tool .on=(options.rerun) @click=rerun> <svg src=CODICONS.REFRESH>
					<input$address type='text' placeholder='/'>
					
			<div$body[flex:1] @click=toggle>
				<div$bounds[rd:inherit] @resize=reflow>
					# scale:{scale} w:{iw}px h:{ih}px 
					<div$frame.frame[rd:inherit] @click.stop>
						$iframe
						<div.resizer.x @touch=resize(e,'x')>
						<div.resizer.y @touch=resize(e,'y')>
						<div.resizer @touch=resize>
						<div$cover @click=toggle>
						# <div[pos:absolute transform-origin:100% 100% b:0 r:0 p:2 fs:sm/1 c:gray5 d:none ..resizing:block scale:{1 / scale}]> "{iw - 2} x {ih - 2}"
				<div$controls @click.stop>
					<button.btn bind=size value='auto-auto'> 'auto'
					<button.btn bind=size value='482-auto'> 'xs'
					<button.btn bind=size value='642-auto'> 'sm'
					<button.btn bind=size value='770-auto'> 'md'
					<button.btn bind=size value='1026-auto'> 'lg'
					<button.btn bind=size value='1282-auto'> 'xl'
					# <button%btn bind=size value='768x1024'> 'tablet'
					# <button%btn bind=size value='1280x1024'> 'desktop'
					<button.btn @click=maximize> '⤢'
			if commands..length or options.footer
				<.footer>
					css pos:relative d:hflex ai:center py:2 mx:-1 j:flex-start
					css .cmd c:gray6 px:2 py:1 fw:500 us:none fs:sm bg:gray1 bd:gray4
					# <.tools[pos:abs]>
					for command in commands
						<.tool.cmd @click=execCommand(command)> command.name
					# <div[fl:1]>
					# <.tool .on=(options.rerun) @click=rerun> <svg src=CODICONS.REFRESH>
			<repl-console$console mode=(mode == 'console' ? mode : 'transient')>

	def rerun
		refresh!

	def refresh
		return unless url
		$refreshed = yes
		$iframe.src = url