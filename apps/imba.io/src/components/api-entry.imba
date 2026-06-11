import { @setting } from '../util/decorators'
import * as CODICONS from 'imba-codicons'
import {api,ls} from '../store'
import API,{icons} from '../api'
import type {Entity} from '../api'

def template str
	str = str.trim!
	let cache = new Map
	return do(item,...objs)
		if cache.has(item)
			return cache.get(item)
			
		let out = str
		out = out.replace(/%%([\w\-\%]+)/g) do(m,k)
			if k == '%'
				return item

			for obj in objs
				return obj[$2] if obj[$2]
			return item[$2] or ''
		cache.set(item,out)
		return out

const snippets = {}

snippets.cssprop = template `
css div %%name:value # declaration
css div %%name@hover:value # with modifier
<section> <div[%%name:value]> ... # inline style
`

snippets.stylemod = template `
# in declaration
css div
	%%name display:block color:indigo5
	opacity:0.5 %%name:1
# inline style
<section>
	<div[display%%name:block]> ...
`

snippets.cssaliased = template `
# in declaration
css div
	%%name:value
# inline style
<section>
	<div[%%name:value]> ...
# using alias
css div %%alias:value
<div[%%alias:value]>
`

snippets.cssaliased = template `
css div %%%:value # declaration
css div %%%@hover:value # with modifier
<section> <div[%%%:value]> ... # inline style
`

snippets.eventmodifier = template `
<div %%qualifier%%displayName%%detail=handler>
`


css
	h1 fs:34px/1.4 fw:600 pb:2
		span @before c:gray4/40
		span @after c:gray4/40
	h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0 bdb:1px solid hue7
	h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 
	h4 fs:16px/1.2 fw:500 pb:2 bwb:0px mb:0
	b fw:700
	a em fw:500 font-style:normal
	
	a.h3 @force
		fs:18px/1.2 fw:500 pb:1 bwb:0px mb:3 bdb:1px solid hue7 
		c:hue7 d:block w:max-content
		@hover td:none c:hue6

	a.link c:hue7
	
	app-code-inline d:inline-block
		
	.pill
		px:4px py:3px rd:md bg:hue1 c:hue7 d:inline-block fs:sm- lh:14px
		@before c:hue9 fw:normal
		@hover bg:hue2

		&.inherited bg:hue0
		&.lg px:6px py:4px
	
	api-link
		d:inline-block pos:relative
		a c:inherit
			td@hover:underline
		&.customz hue:sky
			@after
				pos:absolute
				content:" "
				d:block
				size:6px
				rd:full
				bg:yellow3
				t:-2px
				r:-2px

	.compact api-link a @before d:none

	dt,dd bdb:1px solid gray2/70 py:2
	dt fw:600 pr:2
	dd c:gray6
	dl
		mb:2 @empty:0 fs:sm
		d:grid gtc: max-content auto
		bdt:1px solid gray2/70

	h3 + dl bdt:0px
	
	api-links
		&.list
			d:block
			> span d:none
			api-link mr:1
	
	.markdown@force >>>
		h1 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		h4 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6
		p my:4 @only:0
		# a c:blue6
		app-code-inline d:inline-block
		
	.markdown >>>
		.h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0 bdb:1px solid hue7
		.h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 
		.h4 fs:16px/1.2 fw:500 pb:2 bwb:0px mb:0

	api-li a
		@before o:0.8 fw:400 c:hue9
		@after o:0.8 fw:400 c:hue9

tag api-el
	
	set namepath value
		data = api.lookup(value)

	set data value
		if typeof value == 'string'
			let str = value
			value = api.lookup(str) or ls(str)
			
		#data = value
		
	get data\Entity
		#data

tag api-link < api-el
	
	def hydrate
		let text = textContent
		let path = dataset.path or text
		data = API.lookup(path) or {displayName: text}
		# console.warn "hydrating!!!",text,data
		
	<self.link.{data.flagstr}>
		<a href=data.href data-qualifier=data.qualifier>
			<span> <slot> dataset.title or data.displayName

tag api-pills
	<self>
		if data.kind.abstract
			<div.abstract> "abstract"
		if data.kind.readonly
			<div.readonly> "readonly"
		if data.kind.experimental
			<div.readonly> "experimental"
		if data.idl?
			<div.idl> "idl"

tag api-li < api-el
	href
	mdn = no
	name

	css d:hflex ja:center ws:nowrap jc:flex-start min-height:1rh
		a d:hflex ai:baseline ws:pre
			i font-style:normal
			text-underline-offset:2px
		
		.icon
			@before fs:11px/1 pos:absolute t:100% l:100% c:hue6 fw:bold
				ts:-1px 0px 0px white, 0px -1px 0px white, -1px -1px 0px white
				x:-50% y:-50%
				ml:-0.1icon
				mt:-0.1icon
		
		&.inherited .icon o:0.8
			@before content:"▲"
		&.event .icon @before content:""
		&.custom .icon o:1
			@before content:"★"

		&.modifier a suffix:$detail
		&.event a suffix:$detail
		&.css a suffix:$detail
		&.mdn a suffix:""		

		.name px:1
		.summary c:gray5 px:1 ws:nowrap of:hidden text-overflow:ellipsis w:50px
			>>> p d:contents
		.flex fl:1

		&.mdn hue:blue
		&.short .qf d:none
		.pills ws:nowrap d:hflex ja:center

		&.head
			&.method a prefix:$qualifier "."
		
		
	set icon value
		#icon = value
		
	get icon
		#icon or (mdn ? CODICONS.BOOKMARK : data.icon)

	<self .{data.flagstr} .mdn=mdn>
		css $qualifier:{"'{data.qualifier}'"} $detail:{"'{data.detail}'"}
		<span.icon> <svg src=icon>

		<a.name href=(href or (mdn ? data.mdn : data.href)) target=(mdn ? '_blank' : undefined)>
			if name
				<em> name
			elif data.member?
				<em> data.displayName
				if data.callable?
					<em> "()"
			else
				<em> data.displayName
				if data.callable?
					<em> "()"
		<api-pills.pills data=data>
		<.summary.flex innerHTML=data.summary>
		

tag api-links
	pills = no
	
	<self>
		let up = data
		if up.length
			<slot>
			for item,i in data
				if i > 0
					<span> (i == data.length - 1) ? " and " : ", "
				<api-link .pill=pills data=item>
			
tag api-parents
	members = []

	<self>
		let up = data.parents
		if up.length
			<p>
				<slot> "This interface inherits properties of "
				for item,i in up
					if i > 0
						<span> (i == up.length - 1) ? " and " : ", "
					<api-link[c:blue7] data=item>
				# if members.length
				# 	<span> ": "
				# 	for item in members
				# 		<api-link[mr:4px].inherited .pill data=item>

tag api-section
	css mt:10
		
	set data value
		if typeof value == 'string'
			value = api.lookup(value)
		#data = value
		
	get data
		#data
		
	<self> <slot>
	
tag api-docs
	<self.html[d@empty:none]>
		if data.#article
			<api-doc-section[d:contents] data=data.#article body-only=yes>
		elif data.guide
			<api-doc-section[d:contents] data=data.guide body-only=yes>
		elif data.desc
			<div innerHTML=data.desc>	
		elif data.summary
			<div.summary innerHTML=data.summary>

	
tag api-entry-examples < api-section
	<self[hue:blue d@empty:none]>
		if data.examples.size > 0
			<slot>
				<h3> "Examples"
			<div> for item of data.examples
				<div[mb:10 @last:4]> <app-code-block href=item.path>

tag api-entry
	css hue:blue
		
		h1
			d:hflex ai:center
			svg size:32px

				
		.grouping c:gray4 fs:xxs w:max-content
			pos:absolute
			bg:white rd:md px:1
			mt:-8px h:16px ml:1
			# font-style:italic
			# mt:8px ml:2px
			fw:500
			# bdb:1px solid #efefef 
			api-links d:inline
			>>> a c:blue6
		
	def breadcrumbs
		<.breadcrumb>
			<span> <a href='/api'> "API"
			for item in data.breadcrumb
				<span> <api-link data=item .self=(item == data)>
				
				
	def props items, owner = data, ownerText = null
		<div[fs:sm d:vflex]>
			css api-li order:2 .custom:0 .idl:-1

			let all = items.unique
			let mine = items.own
			let inherits = all.length - mine.length

			for item in mine
				# if item.owner != owner
				# 	<div.grouping> "Inherited from {<a> (owner = item.owner).displayName}"
				# 	break 
				<api-li data=item>
			
			if inherits > 0
				<api-parents[order:10 py:2 c:gray5] data=owner> ownerText
			# if all.length <log-tag> mine.length
	<self>

const titles = {
	properties: 'Properties'
	variables: 'Properties'
}

tag api-list
	mode = 'list'

	def hydrate
		let text = textContent
		let parts = text.split(' ')
		let q = parts.slice(1).join(' ')
		##key = text
		data = API.lookup(parts[0])
		items = data.all.sorted
		items = items.filter(q) if q
		data = data.symbol

	set path value
		let parts = value.split(' ')
		let q = parts.slice(1).join(' ')
		data = API.lookup(parts[0])
		items = data.all.sorted
		items = items.filter(q) if q
		data = data.symbol

	def resized
		yes

	def render
		let items = self.items

		<self.api.list .{mode} .empty=(items.length == 0) .{mode} @resize.silent=resized>
			<div.items> for item in items
				<api-li data=item key=item.id>

tag api-grid < api-list
	mode = 'grid'

tag api-symbols
	name
	data\Entity
	kind = 'properties'
	mode = 'full'

	@setting(local:1) showInherited

	get #key do ##key or "{kind}-list"

	css &.empty d:none

	def hydrate
		let text = textContent
		let parts = text.split(' ')
		let q = parts.slice(1).join(' ')
		##key = text


		data = API.lookup(parts[0])
		
		mode = dataset.mode
		let sym = closest('api-symbol-entry')..data

		items = data.all.sorted
		if dataset.own
			items = items.own

		items = items.filter(q) if q

	def resized
		yes	

	def render
		let items = self.items or data.all[kind].sorted

		let own = items.own
		let len = items.length
		let inherited = items.length - own.length

		unless showInherited
			items = own

		css 
			api-li order:0 .upcase:10 .custom:-10
			api-li.inherited.modifier order:5

		if showInherited
			css api-li.inherited >>> a
				@before o:0.8 fw:400 c:hue9
				@after o:0.8 fw:400 c:hue9

		<self[mt:10].api .empty=(len == 0) .many=(len > 10) .{mode} @resize.silent=resized>
			<header>
				<h3[d:hflex]>
					<span.name[fl:1 tt:capitalize]>
						<slot> title or name or titles[kind] or kind

					if inherited > 0
						<label[fs:sm c:gray6 us:none d:hflex ja:center]>
							<input[mx:1 mb:1px] type='checkbox' bind=showInherited>
							<span> "Inherited"
			<.list .grid=(flags.contains('compact'))> <div.items>
				for item in items
					<api-li data=item key=item.id .inherited=(item.owner != items.owner)>

tag api-symbol-entry < api-entry

	<self.api>
		# <.breadcrumb>
		# 	# <span> <a href='/api'> "API"
		# 	for item in data.breadcrumb
		# 		<span> <a href=item.href .self=(item == data)> item.navName 
		
		if data.navName != 'API'
			<h1[pt:4]>
				<api-li.head[fl:0 w:auto] data=data>
				if data.mdn
					<a[fs:xs c:blue6 mt:16px ml:1] href=data.mdn target='_blank'> "MDN"

		if data.kind.article
			<api-doc-section[d:contents] data=data.meta.article body-only=yes>

		elif data.ns?
			<api-docs data=data>
			if !data.guide
				<api-symbols kind='namespaces' data=data.all.namespaces>
				<api-symbols kind='variables' data=data.all>
				
				<api-symbols kind='functions' data=data.all>
				<api-symbols kind='interfaces' data=data.all>

		elif data.event?
			<api-docs data=data>
			<api-symbols kind='modifiers' data=data.modifiers>
			<api-symbols kind='properties' data=data.valuetype.all>
				<a href=data.valuetype.href> data.valuetype.name
				<span> " interface"
			<api-entry-examples data=data>

		elif data.kind.css and data.kind.property
			let main = data.main
			<api-docs data=main>

			<api-section>
				<h3> "Syntax"
				# if data.alias
				#	<app-code-block raw=snippets.cssaliased(data)>
				# else
				<app-code-block raw=snippets.cssprop(main)>
				if main.alias
					<p[my:2]> "You can also use the shorthand alias {<app-code-inline> main.alias}"
					<app-code-block raw=snippets.cssaliased(main.alias)>

			<api-entry-examples data=data>
				<h3> "Examples"
				<p[mb:2]> "Here are examples from throughout the site that utilizes this property."

		elif data.kind.property
			<api-docs data=data>
			if data.valuetype and data.kind.readonly
				<p> "The {data.qualifiedName} us a read-only property that returns a {<api-link data=data.valuetype>}"
				# <div> "VALUETYPE!!!"
				# <api-list items=data.valuetype.own>
				# <api-symbols kind='methods' data=data.valuetype.all>
		else
			<api-docs data=data>
			<api-symbols kind='implementors' data=data.all items=(data.implementors or [])>
			<api-symbols kind='events' data=data.own>
			<api-symbols kind='modifiers' data=data.all>
			<api-symbols kind='properties' data=data.all>
			<api-symbols kind='methods' data=data.all>
			<api-entry-examples data=data>
			

tag api-entry-toc < api-el
	
	css
		1rh:24px
		h3 fs:14px/1.2 fw:500 pb:1 bwb:0px mb:1 bdb:1px solid hue7
		
		api-li fs:14px
			>>>
				.summary d:none
				.pills d:none
			
		section mb:5

	css .pill
		px:6px py:4px rd:md bg:hue2 c:hue8 d:inline-block fs:sm- lh:14px fw:500
		@before c:hue9 fw:normal
		@hover bg:hue3
		
		&.inherited fw:400 bg:hue1 @hover:hue2
	
	
	<self[pt:0px]>
		# if data.kind.event
		# 	<section.amber>
		# 		<h3> "Supported Modifiers"
		# 		<div> list(data.modifiers,data.type)
		# 	
		# 	<section.violet>
		# 		<h3> "Related Events"
		# 		<div> list(data.related,data.type)
		
		# if data.kind == 'eventmodifier'
		# 	<section.amber>
		# 		<h3> "Related Modifiers"
		# 		<div> list(data.related,data.owner)
		
		if data.kind.interface
			if data.proto
				<section.blue>
					<h3> "Hierarchy"
					<div>
						for item in data.protos
							<api-li data=item icon=icons.down>
						<api-li[hue:gray my:1] data=data>
						<div> for item in data.inheritors
							<api-li data=item icon=icons.right> # list(data.parents,data.type)
		<section.blue>
			<h3> "Resources"
			<div>
				if data.mdn
					# <a href=data.mdn target='_blank'> "MDN Documentation"
					<api-li mdn=yes data=data name="MDN Documentation">

				for item in data.resources when item
					<api-li[hue:blue] data=item>
	
	
	def list items, owner = data
		<div> for item,i in items
			<a.pill.lg[mr:1 px:1.5] .{item.kind} .inherited=(item.owner != owner) href=item.href>
				<span> item.displayName