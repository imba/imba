import './monaco'
import {ls, File, Dir} from '../store'
import * as sw from '../sw/controller'

import './preview'
import './console'

const editorOptions = {
	scrollBeyondLastLine: false
	readOnly: false
	theme: 'scrimba-dark'
	wordWrapColumn: 100
	wordWrap: 'wordWrapColumn'
	wrappingIndent: "same"
	fontIsMonospace: true
	hideCursorInOverviewRuler: true,
	lineNumbersMinChars: 5,
	lineNumbers: true
	fontSize: 13
	minimap: {enabled: false}
	renderLineHighlight: 'none'
	renderIndentGuides: false
	cursorBlinking: 'smooth'
	matchBrackets: 'never'
	codeLens: false
	detectIndentation: true,
	selectionHighlight: false,
	occurrencesHighlight: false,
	links: false,
	scrollbar: {
		useShadows: false
		verticalScrollbarSize: 8
		horizontalScrollbarSize: 8
	}
}

tag app-divider

tag app-repl
	fs
	
	set project val

		if #project =? val
			if (!currentFile or currentFile.parent != val)
				currentFile = val.files[0]
			run!
	
	get project
		#project
		
	set currentFile val
		if #currentFile =? val
			console.log 'current file did set',e
			if monaco and val
				monaco.setModel(val.model)

			project = val.parent
			if !project.childByName('index.html') and !project.childByName('app.imba')
				run!
	get currentFile
		#currentFile
	
	set url val
		if #url =? val
			let src = `{sw.scope}{val}`
			try
				$iframe.src = src
			catch e
				sw.load!.then do $iframe.src = src

	get monaco
		return $monaco if !global.monaco or $monaco or !$editor
		$monaco = global.monaco.editor.create($editor,Object.assign({},editorOptions,$options))
		$monaco.updateOptions(editorOptions)
		$monaco.setModel(currentFile.model) if currentFile
		relayout!
		$monaco
	
	def build
		examples = ls('/examples')
		#placeholder__ = self
		# $placeholder = self # for the router
		$options = {lineNumbers: true}

		$iframe = new <iframe[pos:absolute width:100% height:100%]>
		$iframe.src = 'about:blank'

		$iframe.replify = do(win)
			$win = win # $iframe.contentWindow
			$doc = $win.document

			let {log,info} = win.console.log
			if $console
				$console.context = win
				$console.native = win.console
				win.console.log = $console.log.bind($console)
				win.console.info = $console.log.bind($console)

		$iframe.onload = do
			try
				let element = $doc.querySelector('body :not(script)')
				flags.toggle('empty-preview',!element)

		self

	def reload
		$console.clear! if $console
		try $iframe.contentWindow.location.reload!

	def run
		let index = project.childByName('index.html')
		let app = project.childByName('app.imba') or currentFile
		$console.clear! if $console
		url = `{project.path}/{index ? index.name : app.name + '.html'}`
		self

	def project-did-set project
		if project
			if (!currentFile or currentFile.parent != project)
				currentFile = project.files[0]
			run!

	def currentFile-did-set file
		if monaco and file
			monaco.setModel(file.model)

		project = file.parent
		if !project.childByName('index.html') and !project.childByName('app.imba')
			run!

	def url-did-set url
		let src = `{sw.scope}{url}`
		try
			$iframe.src = src
			# $iframe.contentWindow.location.replace(src)
		catch e
			sw.load!.then do $iframe.src = src

	def relayout
		let h = $editor.offsetHeight
		let w = $editor.offsetWidth
		let sln = w > 700

		if $monaco
			$monaco.layout(height: h, width: w)
			if sln != $options.lineNumbers
				$monaco.updateOptions(lineNumbers:sln )
			$options.lineNumbers = sln


	def leave
		document.body.focus!
		router.go(#parent.doc ? #parent.doc.href : "/")

	def routeDidResolve route,match
		let src = router.pathname.slice(4)
		# console.log 'routeDidResolve',match,src
		
		let item = ls(src)
		if item isa File
			currentFile = item
		elif item isa Dir
			if item.files[0]
				router.go("/try" + item.files[0].path)
				render!

	def show
		let param = currentFile ? currentFile.path : '/examples/apps/playground/app.imba'
		# how can we make it not replace - but instead go to new url?
		router.go("/try{param}")
		# router.go(currentFile ? currentFile.path : '/examples/apps/playground/app.imba')

	css bg:var(--code-bg) overscroll-behavior: contain
		$sidebar-width:200px
		pl:0 @md:$sidebar-width
		d:flex fld:column @lg:row overflow:hidden
		# l:vflex clip @lg:hflex
		>>> header p:2 3 d:flex ai:center fs:sm fw:500 c:gray6

	css .tab
		pos:relative rd:2 py:1 px:2
		c@hover:gray5 .active:blue4 .active.dirty:yellow4 .active.errors:red5
		.circ
			pos:absolute d:block rd:2 w:8px h:2px top:0
			opacity:0.6 ..active:1
			bg:clear ..active:blue4 ..dirty:yellow4 ..errors:red5

	css .dark .tab bg@is-active:gray8 shadow@is-active:sm bg@is-active@is-dirty:yellow4/5
	css .light .tab c@hover:gray6 c@is-active:gray6 td@is-active:none
	css .underlay pos:fixed inset:0 zi:-1 bg:hsla(214,35%,83%,0.6) d@in-hidden:none

	css $preview
		pb@lt-lg:46px
		d..empty-preview:none
		header d@lt-lg:none

	css $console
		flex-grow..empty-preview:1
		@not-lg pos:absolute inset:0 transition:all 250ms cubic-in-out
			y:calc(100% - 46px) .expanded:0px ..empty-preview:0
	
	css $editor
		span.variable.variable color: var(--code-variable)
		.monaco-editor .error-line + .line-numbers c:red5 fw:bold

	def save
		currentFile.save!
		self

	def goPrev
		if currentFile and currentFile.prev
			router.replace(currentFile.prev.last.path)
	
	def goNext
		if currentFile and currentFile.next
			router.replace(currentFile.next.first.path)

	def render
		<self>
			<div$sidebar tabIndex=-1>
				css	& w:$sidebar-width cursor:default pos:absolute d:block c:cooler4
					top:0 left:0 height:100% zi:100
					transition: all 250ms cubic-in-out
					bg:cooler7/95 @md:cooler7
					x:-100% @md:0 @focus-within:0

					@after
						content: ' '
						bg: linear-gradient(cooler7/0,cooler7)
						d:block pos:absolute width:90% height:80px bottom: 0

					.scroller
						# -webkit-overflow-scrolling: touch
						pos:absolute ofy:auto inset:0 pb:5

					.item
						fs:sm/1.3 fw:500 tt:capitalize c:cooler4/70 @hover:cooler5
						p:1 7 d:block bg@hover:gray9/10
						&.active bg:gray9/20 c:white fw:bold

				<.scroller[pt:3 l:abs scroll-y inset:0 pb:5]>
					<div$back[px:5 pb:3 fs:sm fw:500 c:blue4 td@hover:underline] @click=leave> "⇦ back to site"
					<div.items> for child in examples.folders when child.data.sorted
						<h5[p:1 7 fs:xs c:cooler5 fw:bold tt:uppercase]> child.title
						<div[pb:5]> for item in child.folders
							<a.item route-to.sticky="/try{item.path}"> item.title

			<div.dark[pos:relative d:flex fld:column flex:70% bg:var(--code-bg)] @resize=relayout>
				<header[c:gray6]>
					<button[d@md:none fw:bold fs:lg c@hover:blue5 px:1 mr:2 mt:-2px] @click.stop.prevent=$sidebar.focus!> "☰"
					<span hotkey='left' @click=goPrev>
					<span hotkey='right' @click=goNext>
					<span hotkey='esc' @click=leave>
					<div[d:flex flw:wrap cursor:default]> for file in (project..children or [])
						<a.tab route-to.replace="/try{file.path}" .dirty=file.dirty .errors=file.hasErrors>
							<span.circ>
							<span.name> file.basename
							<span.ext.{file.ext}> "." + file.ext
				
					<div[flex:1]>
					
					<span[opacity:0 fw:bold fs:lg/1 cursor:default] hotkey='command+s' @click.stop=save> ""
					<button[d@lg:none fw:bold fs:lg/1 c@hover:blue5] @click=leave> "✕"

				<div$editor-wrapper[pos:relative flex:1]> <div$editor[pos:absolute inset:0]>

			<div$drawer.light[d:flex fld:column pos:relative flex:1 1 40% bg:white]>
				<div$preview[d:flex fld:column flex:1 bg:white]>
					<header[bg:gray2]> <.tab.active> "Preview"
					<div[pos:relative flex:1]> <div$browserframe[pos:absolute inset:0]> $iframe
				<div.divider>
				<repl-console$console[flb:20% d:flex fld:column]>

	def rendered
		monaco