def any item,context,depth = 0
	return null if depth > 3
	
	let typ = typeof item
	if Array.isArray(item)
		<span.{depth == 0 ? 'part' : 'array'}> for child in item
			<span.member> any(child,context,depth + 1)

	elif typ == 'string'
		<span.string> item
	elif typ == 'number'
		<span.number> item
	elif item isa context.Element
		<log-tag.element context=context depth=depth data=item>
	elif item isa context.Text
		<span.string.textnode> item.textContent
	elif item == null
		<span.null> 'null'
	elif typ == 'object'
		<span.object> for own k,v of item
			<span.pair>
				<span.key> k
				<span.value> any(v,context,depth + 1)
	else
		<span.any.{typ}> String(item)

tag log-tag
	# css & = color:blue7-50 prefix:'<' suffix:'>'
	css .tag color:blue7/50 content@before:'<' content@after:'>'
	css .name color:blue7
	css .attrname color:blue6 ml:1
	css .attrvalue content@before:"="
	css .attrstring color:indigo6 content@before:'"' content@after:'"'
	css .child mx:1 d:block
	css .more color:gray5 px:1 rd:2 bg.hover:gray1 cursor:pointer

	context
	depth
	expanded = undefined

	def toggle
		expanded = !expanded
		render!

	def render
		if expanded == undefined and depth < 2
			expanded = yes
		# collapsed vs not
		let items = data.childNodes
		let text = items.length == 1 and items[0].nodeType == 3
		<self>
			<span.tag @click=toggle>
				<span.name> data.nodeName.toLowerCase!
				<span.attrs> for part in Array.from(data.attributes)
					<span.attr>
						<span.attrname> part.name
						<span.attrvalue> <span.attrstring> part.value
			if expanded and items.length and !text
				<span.children.(d:block ml:3)> for item in data.childNodes
					<span.child> any(item,context,1)
			elif text
				<span.(ml:1)> <span.string.textnode> items[0].textContent
			elif items.length
				<span.more @click=toggle> "..."

tag repl-console-item

	ts = Date.now!
	repeats = 0
	context

	css d:block c:gray6 fw:500
		transition: all 250ms cubic-out

	css >>> .body
		.string
			ws: pre-wrap
			color:green7 content@before:"'" content@after:"'"
		.arg > .string
			color:gray7 content@before:"" content@after:""

		.number color:blue6
		.key color:indigo6
		.arg mr:1
		.array content@before:'[ ' content@after:' ]'
		.array > * + * content@before:', '
		.textnode color:gray6
		.part > .member mr:1
		.object
			m:0
			content@before:'{ '
			content@after:' }'
			.key + .value content@before: ': '
			.pair + .pair content@before: ', '
		
		&[data-count] @before
			content: attr(data-count)
			d:inline-block
			bg:blue6 c:white rd:full ta:center w:5 fs:xs/1.2 mr:1
			pos:relative t:-1px
		&[data-count=1] @before d:none


	duration

	def render
		<self.item>
			<.body data-count=String(repeats + 1)>
				for item in data
					<span.arg> any(item,context,1)

	def show
		let h = offsetHeight
		style.transition = 'none'
		style.opacity = '0'
		style.marginTop = (-h)px
		offsetHeight
		style.removeProperty('transition')
		style.marginTop = 0px
		style.opacity = '1'

	def hide
		unless $hide
			$hide = yes
			let h = offsetHeight
			style.marginBottom = (-h)px
			style.opacity = '0'
			setTimeout(&,250) do parentNode.removeChild(self)
			self

tag repl-console
	css cursor:default $count:0 fs:md/1.4

	css $body >>> .item p:1 2 mx:1 bdb:gray2 bdb@last:clear
	css $snackbars d:block pos:absolute w:100% t:0 l:0 zi:35
	css $snackbars >>> .item .body m:1 p:2 3 rd:sm bg:gray1 bs:xs bd:gray3 fs:sm/1.3

	css .heading d:block p:1 3 0 mx:1 c:gray6 fs:sm fw:500 mb:-2

	css .counter
		bg:gray3 mx:1 px:1 rd:10 min-width:6 color:gray6/70 d:inline-block fs:xs fw:bold ta:center
	
	css $header bg:gray2 p:2 px:3 d:hflex ..transient:none

	native
	context
	count = 0
	mode

	get isTransient
		mode == 'transient'

	def clear
		$body.innerHTML = ''
		$autoclear = no
		count = 0
	
	def autoclear
		$autoclear = yes

	def checkDataEquality a,b
		let i = 0
		let len = Math.max(a.length,b.length)
		while i < len
			return false if a[i] != b[i]
			i++
		return true

	def log ...params
		clear! if $autoclear
		# $body.appendChild <div.item> any(params,context,0)
		let prev = #lastItem

		if prev and (Date.now! - prev.ts) < 300 and checkDataEquality(prev.data,params)
			prev.repeats++
			prev.render!
			return

		let item = #lastItem = <repl-console-item.item context=context data=params repeats=0>

		if isTransient
			let stack = $transientItems ||= []
			let count = $snackbars.children.length
			let fast = stack.length > 5
			let now = Date.now!
			let delay = $nextTime ? Math.max($nextTime - now,0) : 0

			$nextTime = now + delay + (fast ? 0 : 50)
			$snackbars.flags.toggle('stacked',fast)

			while stack.length > 5
				stack.shift!.hide!

			setTimeout(&,delay) do
				stack.push(item)
				$snackbars.appendChild(item)
				item.show!
				setTimeout(&,1500) do
					let idx = stack.indexOf(item)
					if idx >= 0
						item.hide!
						stack.splice(idx,1)
		else
			$body.appendChild(item)
		count++

	def info ...params
		clear! if $autoclear
		$body.appendChild <div.heading> params[0]
		count++

	def relayout e
		$scroller.scrollTop = e.rect.height - $scroller.offsetHeight

	def render
		<self>
			<header$header>
				<.tab.active[flex-grow:1] @click=flags.toggle('expanded')>
					<span> "Console"
					<span.counter> count
				<button[d..transient:none] @click=clear [d:none]=(!count)> 'Clear'
			<div$snackbars>
			<.content[pos:relative flex:1 bg:white]>
				<div$scroller[d:block ofy:auto inset:0 pos:relative]>
					<div$body[d:block] @resize=relayout>