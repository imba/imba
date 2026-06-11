import {highlight,clean} from '../util/highlight'
import * as sw from '../sw/controller'
import {ls,fs,File,Dir} from '../store'
import { getArrow,getBoxToBoxArrow } from "perfect-arrows"
import API from '../api'
import './app-arrow'
import './app-popover'
import '../repl/browser'

def getVisibleLineCount code
	let parts = code.replace(/# [\[\~].+(\n|$)/g,'').replace(/\n+$/,'').split('# ---\n')
	(parts[1] or parts[0]).split('\n').length

tag app-code
	def awaken
		self

tag app-code-block < app-code

	css main
		pos:relative rd:inherit c:$code-color

	css .code pos:relative d:block
		>>> .code-head d:none
		>>> .code-foot d:none
		>>> span.region.hl pos:relative
		>>> span.doc-ref @hover
			bg:black/10 td:underline rd:md
			cursor:help

		&.has-focus >> span@not(.focus)@not(._style) opacity: 0.6
		&.has-hide >>> span.hide d:none
		&.has-hl@hover >> span@not(.hl)@not(._style) opacity: 0.7

	# what should this style?
	css label bg:gray7 rd:md pos:absolute d:flex ai:center p:1

	css .btn px:1 mx:1 c:gray6 fw:500 rd:md bg@hover:gray7/10 outline@focus:none
		@not-md mx:0 ml:1 bg:gray7/90 bg@hover:gray7/100 c:gray4
		@is-active bg:blue6 c:white

	css $editor
		bg:#222b39 rd:inherit

	css	$header pos:relative zi:2 bg:#3d4253
		d:hflex @empty:none
		rdt:inherit
		c:gray6 fs:sm fw:500 
		.tabs d:hflex px:2 py:1
		.actions ml:auto px:2 py:1 zi:2
		.item d:block c:gray6 c.on:blue3 py:0.25 mx:1 td:none
		&.collapsed
			.tabs d:none
			.actions pos:absolute t:0 r:0

	css $preview
		min-height:$preview-size
		mt:0 r:inherit
		color:gray6
		pos:absolute
		t:0 l:100%
		w:calc(min(100vw,1340px) - 980px - 40px)
		max-width:500px
		h:100%
		w:$doc-margin
		pl:4
		zi:4
		>>> .frame rd:inherit
		>>> $controls d:none

		pos:relative
		l:0
		h:$preview-size
		m:0
		mt:2
		w:100%
		p:0
		max-width:initial
		rd:sm
		content: "hello"
		>>> $console $header d:none

	css &.console
		$preview h:auto min-height:initial
		$preview >> .body d:none
		$preview >>> $console bxs:xs rd:sm border:1px solid gray3 bg:white
			$header d@force:none
			$scroller max-height@force:140px p:1 fs:sm
		

	lang
	options = {}
	dir
	files
	file
	size
	hlvar
	editorHeight = 0

	set href href
		return unless #href =? href
		files = []
		file = null
		example = null
		demo = {}

		let lineCounts = []
		let meta = {}

		if href
			let url = new URL(href,global.location.origin)
			for [key,value] of url.searchParams
				options[key] = value

			example = ls(url.pathname)
			# log 'found example?!?',example,url.pathname,options
			if options.dir
				file = example
				example = example.parent
				
			if example
				meta = example.meta or {}

		Object.assign(options,meta)

		if example isa File
			files = [example]
		elif example isa Dir
			files = example.files

		for file in files
			lineCounts.push(getVisibleLineCount(file.body))

		file ||= files[0]
		mainLines = lineCounts[files.indexOf(file)]
		maxLines = Math.max(...lineCounts)
		minLines = Math.min(...lineCounts)
		render!
		
	set raw value
		if #raw =? value
			file = File.temporary(value,'imba')
			files = [file]
		

	def hydrate
		files = []
		file = null
		demo = {}

		let lineCounts = []
		let meta = JSON.parse(dataset.meta or '{}')
		let path = "/examples{dataset.path}"

		example = null

		if dataset.href
			let url = new URL(dataset.href,global.location.origin)
			for [key,value] of url.searchParams
				options[key] = value
			example = ls(url.pathname)
			if options.dir
				file = example
				example = example.parent
			

		Object.assign(options,meta)

		if example isa File
			files = [example]
		elif example isa Dir
			files = example.files
		else
			let parts = getElementsByTagName('code')
			for part,i in parts
				let data = {
					name: part.dataset.name or "index.{part.dataset.lang}"
					lang: part.dataset.lang
					body: clean(part.textContent)
				}
				let file = fs.register(path + '/' + data.name,data)
				files.push(file)
				
			if parts.length
				example = files[0]


		for file in files
			lineCounts.push(getVisibleLineCount(file.body))

		file ||= files[0]

		if file.name == 'main.imba'
			options.preview ||= 'md'

		mainLines = lineCounts[files.indexOf(file)]
		maxLines = Math.max(...lineCounts)
		minLines = Math.min(...lineCounts)

		render!

	def mount
		schedule!
		render!
	
	def unmount
		unschedule!

	def openFile file
		self.file = file
		render!

	def openInEditor
		router.go("/try{file.path}")
		self

	def bindExports exports
		example = exports

	def pointerover e
		let vref = null
		if let el = e.target.closest('.__ref')
			vref = el.className.split(/\s+/g).find do (/symbol--\d+/).test($1)
		
		if vref != hlvar
			if hlvar
				el.classList.remove('highlight') for el in getElementsByClassName(hlvar)
			if vref
				el.classList.add('highlight') for el in getElementsByClassName(vref)
			hlvar = vref
		
		let tokel = e.target.closest('[data-nr]')
		let token = tokel and file.highlighted.tokens[tokel.dataset.nr]

		if tokel and token
			if tokel.#awakened =? yes
				awakenToken(tokel,token)
		
		let rule = e.target.closest('.scope-rule')
		if #hoveredRule =? rule
			focusStyleRule(e) if rule and !#clickedRules
			
	def awakenToken el, token
		return unless token..match
		let entity = API.getEntityForToken(token)
		
		if entity
			# console.log 'got entity?',token,entity
			el.#entity = entity
			el.flags.add('doc-ref')

	
	def setStateFlag e
		let value = e.target.textContent.slice(1)
		if demo.vars..flag
			demo.vars.flag = value
			demo.commit!
	

	# the selectable items in a css preview

	def focusStyleRule e
		let rule = e.target.closest('.scope-rule')
		let sel = rule.firstElementChild.textContent.trim!

		if e.type == 'click'
			#clickedRules = yes

		# console.log 'clicked selector',sel
		if sel.match(/^\.demo-/)
			focusedRule = rule
			if demo.vars..flag
				demo.vars.flag = sel.slice(1)
				demo.commit!

	set focusedRule val
		let prev = #focusedRule
		if #focusedRule =? val
			prev..flags..remove('_selected_')
			val..flags..add('_selected_')

	def demoLoaded e
		# console.log 'demo loaded',e
		demo = e.detail

	def intersecting e
		# log 'snippet intersecting',e
		flags.toggle('entered',e.isIntersecting)
		
	def render
		return unless file
		let name = (files[0] && files[0].name or '')
		let fflags = name.replace(/\.+/g,' ')
		let hl = file and file.highlighted

		<self.p3d.snippet.{options.preview}.{fflags} .preview-{options.preview} .multi=(files.length > 1)
			tabIndex=-1
			@click.sel('.scope-rule *,.scope-rule')=focusStyleRule
			@click.sel('.doc-ref').!mod=(router.go(e.target.#entity.href))
			@click.sel('.doc-ref').mod=(window.open(e.target.#entity.href))
			@keydown.esc.stop=(#clickedRules = no)
			@pointerover.silent=pointerover
			@intersect.silent=intersecting
			>
			

			css pos:relative rd:sm d:block .shared:none
				fs:13px/1.5 @md:15px/1.4
				ls:-0.1px
				$bg:#222b39
				$preview-size:72px .md:120px .lg:180px .xl:240px
				$mainLines: {mainLines}
				$minLines: {Math.min(maxLines,14)}
				>>> $code
					box-sizing:content-box
					h:calc($mainLines * 1lh)
					d:block of:auto ff:mono ws:pre px:5 py:0.75lh
					pre w:100px
					&.ind1 .t0 d:none
					&.ind2 .t1 d:none

			css &.inline-preview >>> $frame bd:none bg:clear

			css &.preview-inline
				main d:hflex bg:$bg p:0
				$editor fl:1
				$preview
					w:260px as:stretch m:0 h:auto bg:black/15
					>>> $frame bd:none bg:clear rdr:inherit


			css &.preview-styles
				main d:hflex bg:$bg p:0
				$code d:contents
				$editor d:block fl:1 1 65% m:2
				$preview
					h:auto m:0
					fl:none
					bd:none
					w:280px @!900:35%
					>>> .frame bg:clear bd:none bg:#1a212a
				.actions d:none

				@!580
					main d:vflex
					$preview h:100px w:auto

				# p:1lh of:visible h:auto pr:40%
				>>> $code
					py:10px px:10px h:auto
					pre ws:pre-line
					pre,b d:contents
					span d:none
					.keyword.css d:none
					.tab d:none
					.scope-rule my:1px d:block rd:sm p:0.5 px:2
						bg:blue4/0 @hover:blue4/15
						span,b d:inline
						.tab d:none
						.group-sel d:none
						&._selected_ bg:blue4/25
						.comment fs:11px ff:sans
						.group-props
							prefix: "css"
							# suffix: "]>"
							ws:nowrap
							@before,@after c:var(--code-keyword)
							> .white@last d:none

			<main$snippet.p3d.snippet-body @exports=bindExports(e.detail)>
				<div$editor.code.p3d .tabbed=(files.length >= 2)>
					css .actions o:0 transition:opacity 100ms
					css @hover .actions o:1
					<div$tabbar .collapsed=(files.length < 2)>
						css pos:relative zi:2 bg:#3d4253
							c:gray6 fs:sm fw:500 rdt:inherit d:hflex j:space-between
							.item d:block c:cooler4/90 c.on:blue3 py:0.25 px:1.5 td:none fw:600 rd:lg mx:0
								cursor:pointer
								ease:0.1s ease-in-out
								c@hover:blue4
								&.on bg:#354153
						<div[d:hflex ..collapsed:none px:1 py:1].tabs> for item in files
							<a.tab.item .on=(file==item) @click.stop.silent=openFile(item)> item.name
						<div[px:2 py:1 zi:2].actions>
							<div.item @click=openInEditor> "edit"
								css @not(@hover) c:warm1
						css &.collapsed .actions pos:abs t:0 r:0
					if file
						<app-code-file.p3d key=file.id file=file data=hl>
				if options.windowed
					<repl-browser$browser.browser-bounds
						options=options
						root=example
						file=files[0]
						dir=dir
						mode=options.preview
						@loaded=demoLoaded
					>
				elif options.preview
					<app-repl-preview$preview
						options=options
						root=example
						file=files[0]
						dir=dir
						mode=options.preview
						@loaded=demoLoaded
					>
			if file and file.meta.foot
				<div.markdown[my:2 bdl:1px dashed gray3 rdbl:6px ml:3 pl:3 c:gray5 pb:2] innerHTML=file.meta.foot>

css app-arrow c:green5
	>>>
		path stroke:currentColor stroke-linecap:round stroke-dasharray:3px 3px
		polygon fill:currentColor stroke-linejoin:round
		$end d:none
		$start stroke:currentColor stroke-width:2px

tag app-code-annotation

	def hydrate
		options = JSON.parse(dataset.options or '{}')
		# body = dataset.body
		log "hydrating!!!",options
	
	def render
		log 'rendering app-code-annotation'
		<self>
			<span> options.pre
			css pos:abs y:-100%
			# css div pos:abs t:{options[3] * 120}% l:{options[4]}ex
			css .mark d:inline-block bdb:1px solid yellow3
			<span.mark> options.marked
			css .box pos:abs ml:3ex mt:-4ex
			<span.box> <span[ff:notes fw:400 c:yellow2 fs:md]> options.comment

global css app-code-file

	.item mx:2 pos:relative pe:auto
		ff:notes fw:400 c:green6 ta:center
		min-width:60px @md:100px
		fs:sm/0.9 @md:md/0.9 z:100px
		.box tween:styles 0.2s ease-in-out pe:auto
		# &.inlined 
		c:green3 ts:0px 3px 3px black/15 fs:md/0.95
	.item@even t:-10px

	.highlights pos:abs p:0 t:0 l:0 zi:5 pe:none # d:hflex ai:center ta:center
	.left-highlights pos:abs t:0 r:100% w:200px zi:5 pe:none d:vflex ai:flex-end jc:center
	.bottom-highlights pos:abs t:100% l:0 w:100% zi:5 pe:none d:hflex ai:flex-start jc:center

	app-arrow
		eo:opacity 0.2s
		c:green3
		svg et:0.2s ease-in-out
		# &.inlined
		c:green3

	&.leaving
		.item .box y:10px o:0
		app-arrow $scale:0.85 o:0

tag app-code-file
	file

	def setup
		hlpos = {x: 0, y: 0}
		pt = pl = 0
		tipMode = 'sm'
		self

	def printAnnotations
		let out = for item\<app-popover> in querySelectorAll('app-popover')
			item.serialize!

		await global.navigator.clipboard.writeText(out.join('\n'))
		log out.join('\n')

	def mount
		relayout!

	def intersect e
		relayout!

	def scrolled e
		let sx = $code.scrollLeft
		let sy = $code.scrollTop
		$overlays.style.transform = "translate3d({-sx}px,{-sy}px,0px)"
		

	def relayout
		# let style = window.getComputedStyle($code)
		return unless offsetParent
		let gutter = pageRect.left
		if !window.debug
			tipMode = gutter > 200 ? 'lg' : 'sm'

		$overlays.style.width = $anchor.cachedWidth + 'px'
		$overlays.style.height = $anchor.cachedHeight + 'px'
		for item\<app-popover> in $overlays.children
			item.relayout!
		yes

	css &.debug @hover
		$hl outline:1px dashed red4
		.item outline:1px dashed blue4

	<self[d:block pos:relative] .debug=(window.debug) @intersect.in.once.silent=intersect>
		<div$sizer.sizer[pos:abs t:0 l:0 w:2vw h:2vh pe:none] @resize.silent.debounce(50ms)=relayout>
		<code$code[ff:mono].{data.flags} @scroll.passive=scrolled>
			<span$anchor[pos:abs]> " "
			<pre$pre[w:100px ta:left].code innerHTML=data.html>
		<$overlays.overlays[pos:abs t:0 l:0 h:100% w:100% pe:none].p3d>
			for hl in data.highlights
				<app-popover frame=self data=hl>
		if window.debug
			<div[pos:abs t:-16 l:0 c:black fs:sm]>
				for m in ['lg','sm']
					<span[px:1] @click=([tipMode = m,relayout!]) [bg:green4]=(tipMode == m)> m
				
tag app-demo < app-code-block

	def setup
		files = []
		file = null
		example = null
		demo = {}

		let lineCounts = []
		let meta = {}

		if href
			let url = new URL(href,global.location.origin)
			for [key,value] of url.searchParams
				options[key] = value

			example = ls(url.pathname)
			
		Object.assign(options,meta)

		if example isa File
			files = [example]
		elif example isa Dir
			files = example.files

		for file in files
			lineCounts.push(getVisibleLineCount(file.body))

		file = files[0]
		mainLines = lineCounts[0]
		maxLines = Math.max(...lineCounts)
		minLines = Math.min(...lineCounts)
		render!


tag app-code-inline < app-code
