import '../util/layout'

class Demo
	constructor win
		win = win
	
	def commit
		win.$commit!

###
Custom rect that allows setting all corners individually while
still keeping all properties computed somehow.
###
class Rect
	constructor x,y,w,h
		x = x
		y = y
		width = w
		height = h
		minWidth = 200
		minHeight = 200

	get left do x
	get top do y
	get right do left + width
	get bottom do top + height

	set top value
		let btm = bottom
		height = Math.max(btm - Math.max(value,0),minHeight)
		y = btm - height
	
	set left value
		let rgt = right
		width = Math.max(rgt - Math.max(value,0),minWidth)
		x = rgt - width

	set bottom value
		height = Math.max(value - top,minHeight)

	set right value
		width = Math.max(value - left,minWidth)



tag repl-browser
	dims = new Rect(50,50,300,240)

	options
	root
	file
	mode
	demo
	$win
	$doc
	$console
	exports

	css d:block pe:none

	def build
		t0 = Date.now!
		$iframe = new <iframe[pos:absolute width:100% height:100% min-width:200px rdb:inherit ]>
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
				if options.route
					e.detail.replace(options.route)

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
				
				
			if $console
				$console.context = win
				$console.native = win.console
				$console.autoclear!
				win.console.log = $console.log.bind($console)
				win.console.info = $console.log.bind($console)
		
		if src
			$iframe.src = src

	def mount
		reset!
		document.body.appendChild($window)
		src = options.url or root.replUrl
		$iframe.src = src

	def unmount
		$window.parentNode.removeChild($window)

	def resizing e
		reset!

	def reset
		let rect = pageRect
		dims.y = rect.top
		dims.x = rect.left
		dims.width = rect.width
		dims.height = rect.height
		render!

	<self @resize.silent=resizing>
		<div$sizer[pos:abs t:0 l:0 w:10vw h:10vh pe:none] @resize.silent.debounce(10ms)=resizing>
		<div$window.browser-window>
			css pos:abs l:{dims.left}px t:{dims.top}px w:{dims.width}px h:{dims.height}px
				box-sizing:border-box us:none bg:white rd:lg d:vflex
				bxs:0px 0px 0px 1px black/10, xl
			css .corner pos:abs size:20px
			css .side pos:abs size:20px
			<.box>
				css of:hidden d:vflex bg:white rd:inherit pos:rel fl:1
				<div$titlebar @touch.self.lock.round.sync(dims,'x','y')>
					css pos:relative rdt:md bg:gray2
						d:vflex ai:center jc:flex-end
						bd:gray3 bdb:gray2 p:1
						cursor:grab
					css .tool
						c:gray6 fw:500 us:none fs:sm size:5 d:flex ja:center pe:auto
						svg size:4 c:gray5 stroke-width:2px
						@hover c:blue5 cursor:pointer
							svg c:blue5
					css & + .body rdt:0
					css input bg:white rd:lg bd:gray3 px:2 fs:sm mx:1 fl:1 fw:400 pe:auto
						@focus bd:blue4 bxs:ring
					if options.title
						<.title[fs:sm c:gray5 pe:none]> options.title
				<div$body[fl:1 pos:rel rdb:inherit]> $iframe
			<div.corner[cursor:nwse-resize b:100% r:100%] @touch.lock.round.sync(dims,'left','top')>
			<div.corner[cursor:nesw-resize b:100% l:100%] @touch.lock.round.sync(dims,'right','top')>
			<div.corner[cursor:nwse-resize t:100% l:100%] @touch.lock.round.sync(dims,'right','bottom')>
			<div.corner[cursor:nesw-resize t:100% r:100%] @touch.lock.round.sync(dims,'left','bottom')>
			<div.side[cursor:ns-resize b:100% w:100%]     @touch.lock.round.sync(dims,'-','top')>
			<div.side[cursor:ew-resize t:0 l:100% h:100%] @touch.lock.round.sync(dims,'right','-')>
			<div.side[cursor:ns-resize t:100% w:100%]     @touch.lock.round.sync(dims,'-','bottom')>
			<div.side[cursor:ew-resize t:0 r:100% h:100%] @touch.lock.round.sync(dims,'left','-')>
