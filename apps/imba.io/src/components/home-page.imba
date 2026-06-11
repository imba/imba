const usps = [
	`Compiles to Javascript`
	`Works with Node + npm`
	`Smart, Minimal Syntax`
	`Built-in DOM Tags & Styles`
	`Amazing Performance`
]

const examples = {
	paint: '/examples/paint/app.imba?preview=md&dir=1&titlebar=1&windowed=1&title=Paint Demo'
	game: '/examples/tic-tac-toe?preview=md&windowed=1&title=Tic-tac-toe'
	server: '/examples/express/app.imba?dir=1&preview=md&windowed=1&title=HN Clone&url=https://simple-hn.imba.io/top'
	clocks: '/examples/clock?preview=md&windowed=1&title=Clocks'
}

import * as CODICONS from 'imba-codicons'
import {ls,fs,File,Dir} from '../store'

css .gradient
	bg: linear-gradient(to right,indigo7,blue6,pink6)
	-webkit-background-clip:text
	-webkit-text-fill-color:transparent
	width: max-content
	margin-right: auto

css .card-demo w:100% rd:xl
	>>> main d:hflex bg:$bg p:0
	>>> $editor
		fl:1
	>>> $preview @force
		pos:abs w:0.5cw l:auto r:0 m:0 h:100% w:260px
		$frame bd:none rd:0px bdl:1px dashed white/30 bg:black/15
	
css figure.card
	p:4 w:800px fl:0
	.demo rd:xl
	.demo >>> $editor
		p@force:3


tag home-section
	def intersecting e
		return
		# log 'intersecting',e.isIntersecting,e.ratio
		if #visible =? e.isIntersecting
			relayout!

	def resizing
		#top = offsetTop
		#height = offsetHeight
		#middle = #top + #height * 0.5
		#rect = getBoundingClientRect!

	def relayout
		return unless #visible
		let page = parentNode
		let scrollY = page.#cache.scrollY
		let vh = window.innerHeight
		# distance from top of screen
		let top = #top - scrollY
		#smy = #middle - scrollY - vh * 0.5
		for el in querySelectorAll('.perspective')
			let r = el.pageRect # getBoundingClientRect!
			let y = (r.top + r.height * 0.5) - scrollY
			let x = (r.left + r.width * 0.5) - scrollY
			let poy = y - vh * 0.5
			el.#poy = -poy
			let ptrx = page.#ptrx
			let ptry = page.#ptry
			el.style.perspectiveOrigin = "{ptrx}% calc({-poy}px + {ptry}% * 0.8)"
		yes

	<self.p3d @intersect.silent=intersecting @resize.silent=resizing>
		# css $smy:{#smy}
		# css .mark pos:abs size:4 bg:yellow4 l:10px
		# <div$totop.mark> #smy
		<slot>

tag rotating-shapes
	size = 300
	def setup
		<self.p3d>
			css d:block pos:abs z:-10px w:100vw h:300px
				tween:styles 1s ease-in-out
				@hover transform:rotateY(160deg)
			css div bg:yellow2 w:620px h:300px m:2 pos:abs origin:50% 50% 0px t:50% l:50%
				backface-visibility:hidden
				-webkit-backface-visibility:hidden
			for item,i in [1,2,3,4,5,6,7,8,9]
				<div css:transform="translate(-50%,-50%) rotateY({i / -9}turn) translateZ(-900px)">


import {aliases} from 'imba/compiler'

tag styles-bg
	def setup
		<self> for own k,v of aliases
			<div> k

tag bench-graph
	def setup
		results = [
			name: 'Vue'
			score: 7915
			-
			name: 'React'
			score: 8811
			-
			name: 'Imba'
			score: 237462
		]

		def entered
			flags.add('entered')

		<self.p3d @intersect.in.once=entered>
			css z:-2px
				# $pxpi:0.0152px @md:0.0112px @lg:0.0122px # pixels per iteration / score
				$pxpi:0.0013px
			css .bar bg:gray2
			css &.entered
				.bar bg:gray4
				.Imba .bar bg:blue6
			<.p3d.items[d:hflex c:gray5]> for item in results
				<.p3d.item[fl:1 $score:{item.score} w:100px] .{item.name}>
					css pos:rel d:vflex ja:center
					css &.Imba c:blue6
					<.name> item.name
					<.bar.p3d>
						css pos:abs b:30px h:calc($score * $pxpi) w:6px rd:md x:0 z:1
						<.score[ff:notes  l:50% t:-30px pos:abs x:-50%]> item.score

tag home-page
	#cache = {scrollY: 0}

	css 1cw:90vw @lg:940px @1100:980px # custom container-width unit
		1dw:420px # custom demo-width unit
		1gw:3vw @lg:5vw @xl:8vw # custom gutter-width unit
		1yp:1px @md:3px @lg:4px


		1lgfs:18px @md:24px
		1pfs:16px @md:20px

		1cw:100%
		d:vflex ai:center of:hidden
		transform-style:preserve-3d
		perspective:1000px
		perspective-origin:50% 200px
		$smx:50%
		# max-width:990px
		# ml:$page-margin-left
		# max-width: calc(990px + $page-margin-left)
		pl:$page-margin-left
		pr:$page-margin-right
		pt:8

		

		home-section pos:relative
		home-section,figure d:vflex ja:center as:stretch
		nav,article w:100%

		h1,h22 ff:brand ws:pre-line pb:6
			fs:34px/0.9 @xs:50px/0.9 @sm:60px/0.9 @md:90px/0.9 @1120:100px/0.9 @1220:112px/0.9

		h2.small
			fs:34px/0.9 @xs:40px/0.9 @sm:50px/0.9 @md:80px/0.9 @lg:90px/0.9

		h3 c:cool8
			fs:xl/1.5 @md:2xl/1.5

		h4 pb:6 fw:500 ta:left
			fs:24px/0.9 @xs:30px/0.9 @md:32px/0.9 @lg:32px/0.9

		article p fs:lg/1.4

	css self >>> app-code-block
		main
			$tabbar bg:clear px:2 pt:2 d.collapsed:none

		rd@force:lg

		main
			$tabbar bg@force:clear px:2 pt:2 d.collapsed:none

		$editor rd:lg
			$code h@force:calc($mainLines * 1lh) p@force:2lh
			&.tabbed
				$tabbar px:2 bg@force:clear pt:2
				$code pt@force:0.5lh

		$preview z:10px
			$address d@force:none

		.browser-bounds
			$ar:0.8
			pos:abs l:auto r:-20px m:0 t:40px
			w:320px h:440px
			h:calc($mainLines * 1lh)
			max-width:initial
			max-height:initial

		.tabbed + .browser-bounds t:40px
		
		# shrinking browser window with viewport
		@!936
			.browser-bounds
				w:35%

		@!768
			# $editor rd@force:0
			$editor
				$code pb@force:20
			.browser-bounds
				pos:rel r:auto l:auto t@force:0 y:0% mt:-10 mx:auto
				w:calc(100vw - 96px) h:calc(50vh - 96px)
				min-height:240px
				max-width:calc(100vw - 96px)


		$snippet
			# y:100px
			$entered:0
			transform:translate3d(0px,0px,0px) scale3d(1,1,2.5)
			transform@!680:translate3d(0,0px,0px) scale3d(1,1,3)
			tween:transform 1s cubic-out

		&.entered
			$snippet
				$entered:1
				transform:translate3d(0,0px,0px) scale3d(1,1,1)

				# y:0px
	css self >>> .markdown
			d:contents
			.content d:contents
			.h2 fw:700 fs:44px/1 pb:2 w:100%
			.content > p@first fs:1lgfs
			p my:3 fs:1pfs
				a td:underline c:blue7
			blockquote ta:center mb:0 py:0 bg:clear
			# 1cw:calc(100vw - 80px) @1000:760px @1300:860px
			# 1cw:calc(100vw - 80px) @1000:860px

			app-code-block w:100%
			
			# .h2,p,app-code-block
			# 	w:1cw

			app-code-block + blockquote mt:-6
				p fs:md c:cooler5

			app-code-block my:10

			# @!800
			#	app-code-block w:100% rd:0

	css self >>> home-section
		px:6
		max-width:990px
		& > .bg pe:none rd:20px mx:-15px t:-20px o:1
		&.s0 hue:blue
		&.s2 hue:indigo
		&.s4 hue:sky
		&.s6 hue:warmer

		&.s0 > .bg pos:abs inset:0 z:-2px t:-20px b:0px rotate:0.5deg bg:blue0
		&.s2 > .bg pos:abs inset:0 z:-2px t:-20px b:-20px rotate:-0.6deg bg:indigo0
		&.s4 > .bg pos:abs inset:0 z:-2px t:-20px b:-20px rotate:0.3deg bg:sky0
		&.s6 > .bg pos:abs inset:0 z:-2px t:-20px b:-20px rotate:-0.5deg bg:warmer1

		&.quick-tour @important
			py:0
			.h2 d:none
			> .bg pos:abs inset:0 z:-35px t:-30px b:-20px scale-x:1 rotate:0.3deg bg:#222c39

			.content d:grid gtc: 1fr 1fr
				w:100% pb:40px pt:20px
				app-code-block w:auto my:8 pl:8
				code$code d:contents

				@!1000 gtc:1fr w:90vw max-width:450px pb:80px
				app-code-block my:4

	def caroseul-item href
		<figure.item> <app-code-block.demo href=`/examples/css/{href}.imba?preview=styles`>

	def setup
		#ptrx = #ptry = 50

	def mount
		#onscroll ||= scrolled.bind(self)
		#onpoint ||= pointing.bind(self)
		window.addEventListener('scroll',#onscroll,{passive: yes})
		# window.addEventListener('mousemove',#onpoint,{passive: yes})
		scrolled!

	def unmount
		window.removeEventListener('scroll',#onscroll,{passive: yes})
		# window.removeEventListener('mousemove',#onpoint,{passive: yes})

	def pointing e
		let x = Math.round(e.x * 100 / window.innerWidth)
		let y = Math.round(e.y * 100 / window.innerHeight)

		let oldx = #ptrx
		let oldy = #ptry

		let dx = x - #ptrx 
		let dy = y - #ptry

		if Math.abs(dx) > 3 and !#ptrxsnapped
			x = #ptrx = #ptrx + (dx * 0.01)
		else
			#ptrxsnapped = yes
			#ptrx = x

		if Math.abs(dy) > 3 and !#ptrysnapped
			y = #ptry = #ptry + (dy * 0.01)
		else
			#ptrysnapped = yes
			#ptry = y

		if x != oldx or y != oldy
			relayout!
		return

	def relayout
		# for el in querySelectorAll('home-section')
		# 	el.relayout!
		let poy = #scry + (#ptry - 50) * 0.7
		let pox = 50 + (#ptrx - 50) * 0.4
		style.perspectiveOrigin = "{pox}% {poy}px"
		self

	def scrolled e
		# return

		# log 'scrolled',window.scrollY
		# could alternate / spread them out
		let sy = #cache.scrollY = window.scrollY
		# let poy = Math.round(sy + window.innerHeight * 0.5)
		#scry = Math.round(sy + window.innerHeight * 0.5)
		relayout!
		return

	def resizing e
		if #cache.width =? window.innerWidth
			for el in querySelectorAll('app-popover')
				el.relayout!
		return

	def render
		<self @resize.silent.debounce(100ms)=resizing>
			<.breadcrumb[ta:left w:100% px:6]>
				<span> <a href="/"> "Imba"
				<span.self> <a href="/"> "The friendly full-stack language"
				<app-search-field>
			# <div[h:22px ta:left w:100% px:6 fw:500]> "Imba / Welcome"
			# <rotating-shapes>
			<home-section[pt:10yp pb:10yp]>
				# <h1[py:5].gradient> `Build Fast, Fast.`
				<h1[py:5 fs:120px/1].gradient> `Imba`
				# <div[fs:60px/1]> 'Build Things Fast'
				<div[mt:6]>
					css d:hflex flw:wrap g:10px cg:30px
					<div[fs:xl/1.8 fl:100 1 470px]>
						<p[c:cool8]> `Imba is a Web programming language that's fast in two ways: Imba's time-saving syntax with built-in tags and styles results in less typing and switching files so you can {<u> 'build things fast.'} Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM libraries, so you can {<u> 'build fast things.'}`
						<div[d:block @480:hflex fs:md @580:lg  mx:-2 my:4]>
							css a rd:xl m:2 p:2 bg:hue3 bd:hue3 bcb:hue5 px:4 c:hue8 fw:bold d:block ta:center
								transition:background 300ms
								@hover bg:hue4/85
							<a[hue:green] href="/start"> "Get started"
							<a[hue:blue] href="/try/examples/apps/playground/app.imba"> "Demo"
							css div rd:xl bd:gray2 bg:gray1 m:2 p:2 pr:4 c:gray6 ff:mono bs:solid fw:bold
								fs:sm @580:17px ls:-0.3px d:hflex ja:center
								@before content: '>' c:gray3  px:1
							<div> "npx imba create"
					<ul[min-width:320px fl:1 0 330px]>
						css d:block rd:lg p:6 fs:lg bxs:xxs,lg bg:white/70 h:auto as:start
							@!1024 p:4 fs:md
							@!870 d:none
						for usp in usps
							<li[py:1 d:hflex ai:center px:2 pr:6]>
								<svg[mr:3 size:16px c:purple7] src=CODICONS.ARROW_RIGHT>
								<span> usp

			for item,i in ls('/home/examples').children
				<home-section[my:10 py:10] .s{i} .{item.flagstr}>
					<.bg>
					<.markdown>
						<.h2.html.title.gradient innerHTML=item.head>
						<.content.html innerHTML=(item.html or '')>

			if false
				<home-section[pt:30]>
					<h2[c:pink6]> `Unbelievable\nPerformance`
					<h3[mb:6]> <div[max-width:560px]> `Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM approaches.`
					<.box.p3d[pos:rel]>
						css w:1cw fs:lg d:hflex p:8 px:10
						<div[pos:abs inset:0 bg:warmer2 rd:lg z:-4px]>
						<div.body[w: <460px]> `A benchmark was conducted by comparing a Todo MVC implementation across frameworks. The benchmark steps through a deterministic sequence of state alterations measuring the time taken to reconcile the whole application view after: Toggling an item, removing an item, inserting an item, renaming an item, and doing nothing.`
						<bench-graph[ml:auto as:flex-end z:-3px]>
