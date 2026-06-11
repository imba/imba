import * as CODICONS from 'imba-codicons'
import './util/shared'
import './util/layout'
# import './util/shortcuts'
import './styles'

import './components/app-document'
import './components/app-menu'
import './components/app-code'
import './components/doc-widgets'
import './components/app-search'
import './components/home-page'

import './repl/index'
import API from './api'
import Locals from './util/locals'
import {fs,files,ls,Dir,pathForUrl} from './store'
import * as sw from './sw/controller'

global.flags = document.documentElement.flags

global.debug = yes if document.location.hash.indexOf('debug') >= 0
let isApple = try (global.navigator.platform or '').match(/iPhone|iPod|iPad|Mac/)


css .tab hue:blue

extend tag element
	get site
		global.site
	
tag app-root
	doc
	show-menu

	def setup
		global.site = self
		locals = Locals.for('site')
		yes

	def mount
		await sw.load!
		return
	
	get page
		ls(document.location.pathname) or ls('/language/introduction')

	get announcement
		return {
			id: 'documentation-week-feedback'
			title: 'Can you answer a few questions to help us improve these docs?'
			link: 'https://form.typeform.com/to/GdMKZMBh'
			linkText: 'Take the survey'
		}

	def runCodeBlock data
		if data.example
			router.go(data.example.path)
		elif data.code	
			let file = ls('/examples/apps/playground/app.imba')
			let code = data.code.replace(/^(?=\<\w)/gm,'imba.mount do ')
			code = code.replace(/^# ---\n/gm,'')
			file.overwrite code
			router.go(file.path)

	css $menu
		pt:$header-height
		h:100vh w:$menu-width t:0 pos:fixed
		fs:sm fw:500
		bg:white/96 @lg:clear
		zi:150
		max-width:80vw
		x:-100% @lg:0 @focin:0
		transition:all 250ms cubic-in-out

		@lt-lg
			shadow@focin:0 25px 50px -6px rgba(0, 0, 0, 0.1)

	
	css $repl
		of:hidden inset:0 pos:fixed zi:2000 rd:0 bxs:xl
		transition:transform 250ms quint-out
		y:110% .routed:0

	css $toggler
		pos:fixed t:0 r:0 bg:blue4 size:48px d:flex ja:center rd:md m:4
		d@lg:none zi:200
		svg size:28px c:white
		&.active bg:blue5

	css .open-ide-button
		bottom:0 right:0 m:5 border:gray2 py:3 px:4 rd:3
		cursor:pointer bg:teal5 c:white fw:bold border:teal8/20 bxs:md
		tween:150ms ease-out
		pos:fixed d:block @not-md:none
		@hover y:-2px bxs:lg bg:teal5
		@after o:0.7 fs:xs content: " " $shortcut

	def go path
		self.path = path
		doc ||= ls('/docs/intro')

		let parts = path.replace(/(^\/|\/$)/,'').split('/')

		let state = pathForUrl(path)
		#state = state
		self.st = state

		# redirect home somehow?
		if path == '/' or path == '/index.html'
			doc = ls('/docs/intro')

		elif !path.match(/^\/(home|try)/)
			doc = ls(path) or ls('/404')
			
		if doc isa Dir and doc.find('index')
			doc = doc.find('index')

		global.flags.incr('fastscroll')
		setTimeout(&,500) do global.flags.decr('fastscroll')
		document.body.offsetHeight

		try
			document.documentElement.classList.toggle('noscroll',path.indexOf('/examples/') == 0)
		self

	def render
		if path != router.url.pathname
			go(router.url.pathname)

		let home? = router.match('/$') or router.match('/home')
		let repl? = router.match('/try')
		let api? = router.match('/api')
		

		<self[d:contents]
			@run=runCodeBlock(e.detail)
			@showide=$repl.show!
			@showsearch=$search.show!
			.show-menu=($menu..focused?)
			>
			<div.header>
				css pos:fixed d:flex ai:center
					px:2 w:100% h:$header-height top:0px
					zi:300 fs:15px bg:cool8/98 c:white us:none
					d:none

					.tab d:hflex mx:2 py:1 c:hue4 fs:sm- fw:500 tt:uppercase ja:center
						svg h:16px w:auto mx:0.5 
						span c:white/100 lh:20px pos:relative
							tween:all 0.2s quint-out
							@after content:"" d:block
								tween:all 0.2s quint-out
								pos:absolute h:2px t:100% bg:hue4 r:0 rd:full o:0
								x:-50% l:50% y:0px w:5px max-width:100%

						@hover c:white
							svg scale:1.15 c:hue5
						@!600 span d:none
						@600 svg d:none d@only:block
						.keycap bc:hue4/40 c:hue4/50 h:22px px:1.5 fw:500 ml:0.5 tt:none
						
						span c:hue3
						
						&.active span c:white
							@after o:1 y:0px w:30px 

					.toggler mx:0 d@md:none
						svg tween:styles 0.1s
						@hover c:hue4
							svg scale:1
						&.active svg rotate:-90deg

				<.logo[d:hflex cursor:pointer ja:center c:white] route-to='/'>
					css svg c:blue4
					css @hover svg c:blue5
					<svg[h:20px w:auto mr:2 pos:relative t:2px ml:1] src='./assets/wing.svg'>
					<.logotype[c:white fw:700 fs:xl lh:30px]> "imba"
					
				# <.breadcrumb[mx:2 fs:sm c:blue4]>
				# 	css span + span @before content: "/" mx:1 o:0.3
				# 	<a[p:1 2 fw:600 ml:10px rd:12px bgc:hsla(213.12, 93.90%, 67.84%, 1) c:hsla(215.00, 27.91%, 16.86%, 98%) @hover:white d@lt-md:none] href="https://jobs.scrimba.com" title="well, actually Scrimba is hiring - but learn to code in Imba with pay! "> "We are hiring!"
						
						
				<div[flex:1 ac:center jc:flex-start va:middle d:hflex]>
					<a[mr:4 jc:flex-start d:inline-flex cursor:pointer fs:sm mx:1 a:center] @click.emit('showsearch') @hotkey('mod+k|s')>
						css c:blue4/80 @hover:blue3
						<svg[ml:1 d:block @md:none size:16px va:top pos:relative t:2px] src=CODICONS.SEARCH>
						<span[d:none @md:contents]>
							<span[ mx:1 tt:none fw:normal]> "Quick search for anything ..."
							<span.keycap[bc:hue4/40 c:hue4/50 h:22px px:1.5 fw:500 ml:0.5 tt:none]> isApple ? "⌘K" :'Ctrl K'
					if window.debug
						<div @resize.silent=render> "{window.innerWidth}px"
				<div[d:flex cursor:pointer us:none]>
					# if home?
					<a.tab[hue:emerald] href='/docs' .active=(doc and !doc.api? and !api? and !home?)>
						<svg[mr:1] src=CODICONS.MAP>
						<span> "Learn"
					# <a.tab[hue:cyan] @click href='/api/' .active=(doc and api?)>
					# 	<svg src=CODICONS.BOOK>
					# 	<span> "API"
					<a.tab[hue:blue] @click.emit('showide')>
						<svg src=CODICONS.PLAY>
						<span> "Try"
					<a.tab[hue:indigo] target='_blank' href='https://discord.gg/mkcbkRw'>
						<svg src=CODICONS.COMMENT>
						<span> "Chat"
					<a.tab[ml:4] target='_blank' href='https://github.com/imba/imba'>
						<svg src=CODICONS.GITHUB>
					<a.tab target='_blank' href='https://twitter.com/imbajs'>
						<svg src=CODICONS.TWITTER>
					if !home?
						<a.tab.toggler
							.toggled=($menu..focused?)
							@touch.flag('active')
							@mousedown.prevent=$menu.toggle!
						>
							<svg[h:32px] src=CODICONS.MENU>

			<app-repl$repl id='repl' fs=fs route='/try' .nokeys=!repl?>
			<app-search$search>
			<div$toggler .toggled=($menu..focused?)
				@touch.prevent.flag('active')
				@pointerup.prevent=$menu.toggle!
				>
				<svg src=CODICONS.MENU>
			
			<app-menu$menu current=#state.page>

			if home?
				<home-page>
			elif #state..page
				<app-document[ml@md:$page-margin-left] key=#state.page.id  data=#state.page  .nokeys=repl? hash=document.location.hash breadcrumbs=#state.path>

imba.mount <app-root>
document.scrollingElement.scrollLeft = 0
