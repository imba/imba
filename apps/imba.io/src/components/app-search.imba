import * as CODICONS from 'imba-codicons'
import {ls,fs,File,Dir,find,api} from '../store'
let isApple = try (global.navigator.platform or '').match(/iPhone|iPod|iPad|Mac/)

tag Item
	css cursor:pointer d:hflex px:2 ai:center pos:rel hue:warmer
		
	css
		&.link hue:blue
		&.interface hue:blue
		&.eventinterface hue:blue
		&.eventmodifier hue:amber
		&.event hue:amber
		&.property hue:cooler
		&.method hue:violet
		&.style hue:purple
		&.stylemod hue:purple
		&.styleprop hue:purple
		&.property hue:blue
	
	css .icon c:hue5
		
	# css @lt-md pt:2
	css .qualifier
		pos:abs fs:xxs b:0.5 l:9 c:warmer5 ws:pre d:hflex
	
	css .title
		i font-style:normal
		em fw:500 font-style:normal
		.category c:gray5 fs:smaller
		# mb:10px

	get item
		data.item

	set data value
		# console.log 'did set value',value
		#data = value

		if value.scoreKey
			let m = value.matches[value.scoreKey]
			let val = value.item.searchTitle
			let scoreVal = value.scoreValue
			let pre = ''

			if scoreVal.length < val.length
				let offset = val.length - scoreVal.length
				let pre2 = val.slice(0,offset)
				if val.slice(offset) == scoreVal
					pre = pre2
					val = scoreVal

			if val.length == scoreVal.length
				let k = m.length
				while k > 0
					let part = m[--k]
					val = val.slice(0,part[0]) + "<b>" + val.slice(part[0],part[1]) + "</b>" + val.slice(part[1])

				value.html = pre + val
				# highlight the matching parts

	get data
		#data

	<self @mousedown.stop.prevent.emit('go',item) @pointerover.emit('hover',index) .{item.kind} .{item.flagstr}>
		<span.icon[p:1 mr:1]> <svg[c:hue5] src=item.icon>

		if data.html
			<.title>
				<em innerHTML=data.html>
				if item.detail
					<span.detail> item.detail
				if item.labelName
					<span.category> " {item.labelName}"
		elif item.modifier?
			<.title>
				<em> item.qualifiedName
				<span.category> " modifier"
		elif item.api?
			<.title>
				<em> item.qualifiedName
				<span.detail> item.detail
				if item.labelName
					<span.category> " {item.labelName}"
		elif item.kind == 'event'
			<.title> <em> item.displayName
			<span.qualifier> "Events"
		elif item.modifier?
			<.title>
				<span> item.owner.modifierPrefix + "."
				<em> item.displayName
			<span.qualifier> "Event Modifiers"
		elif item.kind == 'stylemod'
			<.title>
				<em> item.displayName
				# <span[c:gray4 fw:400]> " d:block"
			<span.qualifier> "Styles > Modifiers"
		elif item.kind == 'styleprop'
			<.title>
				# <span> "css "
				<em> item.displayName
				if item.alias
					<i[c:warmer5]> " / {item.alias}"
			<span.qualifier> "Styles > Properties"
		elif item.interface?
			<.title> <em> item.displayName
			<span.qualifier> "Interfaces"
		elif item.api?
			<.title>
				<em> item.displayName
			<span.qualifier> item.kind
			
		else
			<.title.html.title innerHTML=item.qualifiedTitle>
				css c:gray9 fw:500
			# <.qualifier> data.breadcrumb.map(do $1.title).join( " > ")

tag app-search-field

	<self[hue:warm]>
		css c:hue4
		css @hover
			hue:blue
			.keycap bg:hue0
		<a[jc:flex-start d:hflex cursor:pointer fs:sm ai:center] @click.emit('showsearch') @hotkey('mod+k|s')>
			# css c:blue4/80 @hover:blue3
			<svg[d:block size:16px lh:16px va:top pos:relative c:hue4] src=CODICONS.SEARCH>
			<span[mx:1 tt:none fw:normal fl:1 d@!500:none]> "Search docs ..."
			<span.keycap[bc:hue7/40 c:hue7/50 h:20px px:1 fw:500 ml:0.5 tt:none d@!500:none]> isApple ? "⌘K" :'Ctrl K'


tag app-search
	query = ''
	hits = []
	#focus = 0 # number representing the index of match
	show-hits = 16

	def refresh
		if #matchQuery =? query
			let o = {query: query}
			hits = query ? find(query,o) : (recent or [])
			#focus = 0 # Math.max(0,Math.min(matches.length - 1,#focus))
			#pointing = no
			$main.scrollTop = 0

	def mount
		recent = (fs.locals.searchhistory or []).map(do ls($1) ).filter(do(item,i,arr) item and arr.indexOf(item) == i)
		recent = recent.map do {item: $1}
		flags.add('hidden')
		refresh!

	def moveUp
		#focus = Math.max(#focus - 1,0)
		autoScroll!

	def moveDown
		#focus = Math.min((#focus + 1),hits.length - 1,show-hits - 1)
		autoScroll!
		
	def autoScroll
		render!
		# console.log 'autoScroll!',#focus
		let bounds = $main.getBoundingClientRect!
		let el = querySelector(".nr{#focus}")
		let sel = el.getBoundingClientRect!

		let btm = sel.bottom - bounds.bottom + 12
		let top = sel.top - bounds.top - 74
		
		if btm > 0
			$main.scrollBy(0,btm)
			
		elif top < 0
			$main.scrollBy(0,top)
	
		# console.log bounds,sel,sel.bottom - bounds.bottom,btm,top
	
	def goToFocus
		go(hits[#focus])
	
	def go item
		item = item.item or item

		let prev = recent.find(do $1.item == item)

		if prev
			recent.splice(recent.indexOf(prev),1)
		recent.unshift({item: item})
		recent.length = Math.min(recent.length,10)
		# recent = recent.filter(do $3.indexOf($1) == $2)
		fs.locals.searchhistory = recent.map(do $1.item.href)
		router.go(item.href)
		blur!    

	def show
		flags.remove('hidden')
		clearTimeout(#hider)
		focus!
		$input.setSelectionRange(0,query.length)

	def hide
		# flags.remove('entered')
		return
		blur!
		#hider = setTimeout(&,1000) do flags.add('hidden')

	def focus
		$input.focus!

	def blur
		$input.blur!

	def focusout
		hide!
	
	def render
		<self
			@go=go(e.detail)
			@keydown.up.prevent=moveUp
			@keydown.down.prevent=moveDown
			@keydown.enter.prevent=goToFocus
			@keydown.esc=blur
			@focusout=focusout
			@hover.if(#pointing)=(#focus = e.detail)
			.empty=!hits.length
			>
			css inset:0 pos:fixed pe:none d:vflex ja:center zi:1000 j:flex-start
				1rh:40px $selIndex:{#focus} $matches:{matches.length}
				bg:cool9/0
				main y:-5px scale:0.95 o:0 pe:none
				&.empty o:1
				&.hidden d:none
				@focus-within bg:cool9/50
					main y:0px scale:1 o:1 pe:auto
					
				# bg:cool9/50
				# main y:0px scale:1 o:1 pe:auto

			css &.search2 bg:cool9/50
				main y:0px scale:1 o:1 pe:auto

			<main$main tabindex=-1>
				css w:600px bg:white bxs:xxl px:4 ofy:auto rd:md
					mt:20vh h:auto max-height:400px tween:styles 0.2s cubic-in-out
					@lt-md w:90% mt:60px l:5%

				<header[pos:sticky t:0 bg:white/85 zi:10 pt:4 pb:4]>
					
					<div[d:hflex ja:center]>
						<input$input type='text' bind=query 
							@input.debounce(50ms)=refresh
							placeholder="Search docs"
							spellcheck=no
							>
							css p:2 w:100% bg:white rd:md bd:gray2 bxs:xs
								@focus bxs:outline,xs bd:blue4
						<div hotkey='esc' @click=blur>
							css pos:relative w:0 h:6
							css @after d:block h:14px content:"esc" pos:absolute r:2
								rd:md bd:gray2 fs:xs h:100% px:1.5 c:gray5 d:hflex ja:center 
					# <.keycap[pos:abs r:4 t:2 ] hotkey='esc' @click=hide> 'esc'
				if hits == recent
					if recent.length == 0
						<div[pb:4]> <span[c:gray4]> "No recent searches."
					else
						<div[pb:4]> <span[c:gray4]> "Recent"
				<div$items[pos:rel pb:4] [d:none]=!hits.length @mousemove.silent=(#pointing = yes)>
					<div$selection>
						css h:1rh rd:md pos:abs bg:blue4/40 w:100% zi:0 y:calc($selIndex * 100%)
							ea:0.1s cubic-in-out
							o..empty:0
					<div[zi:1 pos:rel]>
						for match,i in hits when i < show-hits
							# console.log "render item {i} {match.item.id}",match.item
							<Item[h:1rh] .nr{i} index=i key=match.item.id data=match>
					
					<div[h:1] @intersect.in=(show-hits += 10)>