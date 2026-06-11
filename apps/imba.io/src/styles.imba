# importing preflight css directly into the client bundle
import './assets/preflight.css'
import './assets/dankmono.css'

global css
	@root
		--font-brand: 'Work Sans', sans-serif
		--font-notes: Kalam, 'Marker Felt', sans-serif
		--font-mono: dm, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
		# font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
		-webkit-font-smoothing: antialiased
		-moz-osx-font-smoothing: grayscale
		--box-shadow-ring: 0 0 0 3px blue4/30
		scroll-behavior:smooth
		$header-height:0px

		$menu-width:240px @md:220px
		$doc-width: 768px
		$doc-margin: calc(100vw - $doc-width - $page-margin-left - 20px)
		$page-margin-left:0px @lg:$menu-width
		$page-margin-right:0px @lg:60px

		1icon:16px
		1rh:36px
		hue:blue
		.icon svg size:1icon

	code,pre ff:mono fw:bold

	.p3d transform-style: preserve-3d
	html ofx:hidden
	html.noscroll body overflow: hidden
	html,body p:0px m:0px
	body pt: $header-height w:100%
	* outline:none

	html.fastscroll scroll-behavior:auto

	.menu-heading d:block p:0 2 fs:sm- lh:22px fw:500 cursor:default
	.menu-link d:block p:1 2 fs:sm fw:500

	.keycap rd:md bd:gray2 fs:xs h:5 px:1 c:gray5 d:hflex ja:center
	
	@root app-code-inline d:inline
	
	.no-scrollbar
	
		&::-webkit-scrollbar w:1 o:0.1
		
	
	.rose hue:rose
	.pink hue:pink
	.fuchsia hue:fuchsia
	.purple hue:purple
	.violet hue:violet
	.indigo hue:indigo
	.blue hue:blue
	.sky hue:sky
	.cyan hue:cyan
	.teal hue:teal
	.emerald hue:emerald
	.green hue:green
	.lime hue:lime
	.yellow hue:yellow
	.amber hue:amber
	.orange hue:orange
	.red hue:red
	.warmer hue:warmer
	.warm hue:warm
	.gray hue:gray
	.cool hue:cool
	.cooler hue:cooler

	.interface hue:blue
	.eventinterface hue:blue
	.eventmodifier,.modifiers hue:amber
	.event,.events hue:violet
	.property hue:cooler
	.method,.function hue:violet
	# .function hue:violet
	.ns hue:yellow
	.property hue:blue
	.property.upcase hue:violet
	.modifier hue:amber
	# .accessor.readonly hue:sky

	.css.property hue:fuchsia
	.css.modifier hue:indigo
	.css.modifier hue:indigo

	.compact
		1rh:28px

	api-link
		c:hue6
		a c:hue6

	api-li
		.icon rd:md mr:1 c:hue6 pos:relative
		a c:hue6
			text-underline-offset:2px
			@hover td:underline

	api-li.head
		w:100%
		fl:1
		1icon:32px
		bdb:none
		.icon size:1icon c:hue6
			svg size:1icon c:hue6
		fs:inherit
		c:gray7
		# a c:gray7 td@hover:none
		a c:gray7
		a em c:inherit
		a@hover td:none
		.qf d:inline fw:400
		.summary d:none
		.pills@force d:none
		.detail fw:400

	api-li
		.pills order:1 ws:nowrap hue:yellow c:default 
			> * fs:11px/1 order:1 ml:1 rd:sm px:4px py:2px bg:hue1 c:hue7/80 fw:500
			.source hue:sky
			.abstract hue:gray c:gray5
			.readonly hue:cooler c:cooler5
			.idl hue:blue

	.head.h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:2 bdb:1px solid hue7
	.head.h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 
	.head.h4 fs:18px/1.2 fw:500 pb:0 bwb:0px mb:2 bdb:0px solid hue7 mt:6 mb:0

	

	.html
		a c:blue7 td@hover:underline

		h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0 bdb:1px solid hue7
		h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 
		h4 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6

		# .head.h4 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 mt:6

		app-code-inline
			d:inline-block fs:0.75em ff:mono lh:1.25em
			bg: gray3/35 rd:sm va:middle p:0.1em 5px
			-webkit-box-decoration-break: clone

		api-link
			d:inline-block
			c:hue8
			a bg:hue1 px:1 py:0.5 rd:md fs:smaller

		p my:3

		p.large fs:18px

		ul
			list-style: disc outside pl:7
			li
				fs:md/1.3 pos:relative
				> p > code d:table mb:1 fw:600

		blockquote
			bg:gray2 my:3 p:2 px:3
			color:gray8 fs:md-
			p fs:inherit
			> mt@first:0 mb@last:0

			&.line
				bdl:3px solid gray2 mx:3 p:0 pl:3 c:gray6 bg:clear

			# &.box
			rd:md py:4 px:5 fs:sm
			bg:hue1 c:hue9 pos:relative

			# &.tip hue:green
			# 	bg:hue1 c:hue9
			# 	# bd:1px solid hue6/10
			# 	# bdb:2px solid hue6/30

			app-code-inline bg:hue8/10
				

		app-code-block + app-code-block
			mt:4

		# app-code-block + blockquote
		# 	bdl:3px solid gray2 mx:3 p:0 pl:3 c:gray6 bg:clear
	
	.ultable ul
		list-style:none pl:0
		li > p@first fs:16px fw:600
			.code fs:15px fw:inherit
		p pl:4 @first:0 mb@first:-2

		# as grid here
		d:grid gtc:max-content 1fr
		li d:contents
	
	.breadcrumb
		fw:400 fs:sm d:hflex ai:center
		& > span
			c:gray5
			@last @after d:none
			@after
				c:gray4
				# fw:600
				# fs:xs
				mx:1.5
				content: "/"
			a fw:500 c:blue6

		.self c:gray5
			a c:inherit
		# bdb:1px solid gray3 pb:1 mb:1

	.api
		.html
			.h2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0 bdb:1px solid hue7
			.h3 fs:18px/1.2 fw:500 pb:2 bwb:0px mb:2 bdb:1px solid hue7 
			.h4 fs:16px/1.2 fw:500 pb:2 bwb:0px mb:0

	.list
		fs:sm d:vflex
		& > .items d:contents
		api-li
			bdb:1px solid #efefef 
			a fw:500
			.qf d:none
			.icon px:0
			.name fs:15px c:hue7
			.summary fs:13px c:gray5
				p d:contents

			.detail c:hue7/80 fw:400 pl :1 d@empty:none
			.pill fs:xxs py:0px hue:gray order:1 ml:1 c:gray5
			

			order:0 .upcase:10 .custom:-10
			&.inherited.modifier order:5

	p + p > .list@first bdt:1px solid #efefef
		
	.list.grid
		fs:13px
		1rh:28px
		d:grid gtc:1fr 1fr 1fr rg:0 cg:1
		api-li ofx:hidden bdb:none
			.icon mr:0.5
			.name fs:14px
			.summary fs:12px d:none
			# .pills@force d:none


# code
global css @root
	--code-color: #e3e3e3;
	--code-identifier: #9dcbeb;
	--code-constant: #8ab9ff # #d7bbeb;
	--code-bg: #202732;
	--code-background: #282c34;
	--code-bg-lighter: #222b39; # #29313f;
	--code-selection-bg: red;
	--code-bracket: #92a3b1;
	--code-comment: #718096;
	--code-keyword: #ff9a8d; # #e88376;
	--code-operator: #ff9a8d;
	--code-delimiter-operator:#6d829b;
	--code-numeric: #63b3ed;
	--code-boolean: #4299e1;
	--code-null: #4299e1;
	--code-entity: #8ab9ff;
	--code-string: #77b3d1;
	--code-entity: #8ab9ff;
	--code-regexp: #e9e19b;
	--code-mixin:#ffc87c;
	--code-mixin:#e9e19b;
	--code-this: #63b3ed;
	--code-tag: #e9e19b;
	--code-tag-event: #fff9c3;
	--code-tag-reference: #ffae86;
	--code-tag-angle: #9d9755; # #9d9755
	--code-type: #8097b2; # #839fc7;
	--code-type-delimiter:#5e6c7d;
	--code-property: #F7FAFC;
	--code-decorator: #63b3ed;
	--code-variable: #e8e6cb;
	--code-global-variable: #faffb2; # #ecd5f1; # #dcb9e4 # #ffc3c3;
	--code-root-variable: #d7bbeb;
	--code-import-variable: #e0ade3;

	--code-font: "Source Code Pro", Consolas, Menlo, Monaco, Courier, monospace;
	--code-rule-mixin: #ff9292;
	--code-rule: #ffb8b8;
	--code-style: #c8c9b6;
	--code-style-scope: #fad8bf;
	--code-style: #e0ade3;
	--code-style-bracket:#e0ade3; # #e9e19b;
	--code-style-unit: #a49feb; # #ff9191;
	--code-style-scope: #eb9fe5;
	--code-style-delimiter: #8FFc7590;
	--code-style-value: #a49feb;
	--code-style-value-scope: #eec49d;
	--code-style-value-size: #ff8c8c;
	--code-style-property: #e0ade3;
	--code-style-property-scope: #df8de4; # #e9e19b;
	--code-css-property-modifier: #df8de4;

	--code-style-var: #ff93d0;F
	--code-keyword-css: #fff7b6;
	--code-selector: #e9e19b;
	--code-selector-pseudostate: var(--code-selector);
	--code-selector-context: #eec49d;
	--code-selector-operator: #ff9a8d;
	--code-selector-placeholder:hsl(321, 100%, 79%) # hsl(36, 100%, 72%);
	--code-key: #9dcbeb;
	--code-delimiter: #e3e3e3
	--code-delimiter-operator:#889cd6
	--code-special: #fffab4

global css .markdown
	.mh1 fs:34px/1.4 fw:600 pb:2
	.mh2 fs:26px/1.2 fw:600 pb:3 bwb:0px mb:0
	.mh3 fs:22px/1.2 fw:500 pb:3 bwb:0px mb:0
	.mh4 fs:20px/1.2 fw:500 pb:2 bwb:0px mb:0

global css .code
	tab-size:2
	-moz-tab-size:2
	cursor:default
	fw:500

	b,i fw:inherit font-style:normal

	* @selection bg:blue5/40

	.invalid color:#92a3b1
	.entity.other.inherited-tag color: var(--code-entity)
	.entity.other.inherited-class color: var(--code-entity)
	.comment color: var(--code-comment) font-style:italic fw:500
	.regexp color: var(--code-regexp)
	.tag color: var(--code-tag)
	.type color: var(--code-type)
	.type.start color: var(--code-type-delimiter)
	.delimiter.type color: var(--code-type-delimiter)
	.entity.name.type color: var(--code-entity)
	.keyword color: var(--code-keyword)
	.argparam color: var(--code-keyword)
	.delimiter color: var(--code-delimiter)
	.operator color: var(--code-operator)
	.property color: var(--code-property)
	.numeric color: var(--code-numeric)
	.number color: var(--code-numeric)
	.boolean color: var(--code-boolean)
	.null color: var(--code-null)
	.identifier color: var(--code-identifier)
	.uppercase color: var(--code-constant)
	.accessor color: #f3f3f3
	.key color: var(--code-key)
	.key + .operator color: var(--code-key)
	.variable color: var(--code-variable)
	.string color: var(--code-string)
	.propname color: var(--code-entity)

	span.curly c:var(--code-bracket)
	span.square c:var(--code-bracket)
	span.paren c:var(--code-bracket)
	
	.this color: var(--code-this)
	.self color: var(--code-this)
	.constant color: var(--code-constant)
	
	.tag.reference color: var(--code-tag-reference)
	.tag.open color: var(--code-tag-angle) o:0.75
	.tag.close color: var(--code-tag-angle) o:0.75
	.tag.event color: var(--code-tag-event)
	.tag.event-modifier color: var(--code-tag-event)
	.tag.mixin color: var(--code-mixin) fw:bold
	.tag.rule-modifier color: var(--code-rule-mixin)
	.tag.rule-modifier.start opacity: 0.43
	.tag.rule color: var(--code-rule)

	.constant.variable color: var(--code-constant)
	.variable.global color: var(--code-global-variable)
	.variable.imports color: var(--code-global-variable)
	.decorator color: var(--code-decorator)
	
	.style.open color: var(--code-style-bracket) o:0.5
	.style.close color: var(--code-style-bracket) o:0.5
	.style.args.open color: var(--code-style)
	.style.args.close color: var(--code-style)
	.style color: var(--code-style)
	.style.scope color: var(--code-style-scope)
	.selector color: var(--code-selector)
	.unit color: var(--code-style-unit)
	.style.delimiter color: var(--code-style-delimiter)
	.style.property color: var(--code-style-property)
	.style.property.modifier color: var(--code-style-property-scope)
	.style.value color: var(--code-style-value)
	.style.value.var color: var(--code-style-var)
	.style.value.size color: var(--code-style-value-size)
	.style.value.scope color: var(--code-style-value-scope)
	.style.modifier color: var(--code-style-value-scope)
	.selector.pseudostate color: var(--code-selector-pseudostate)
	.selector.operator color: var(--code-selector-operator)
	.selector.context color: var(--code-selector-context) 
	.selector.mixin color: var(--code-mixin) fw:bold
	.style.start-operator color: var(--code-delimiter-operator)
	span.operator.dot color:var(--code-identifier)
	span.region.more d:none d@md:contents

	.parameter_ c:var(--code-variable)
	.variable_ c:var(--code-variable)
	.variable_.global_ c:var(--code-global-variable)
	.variable_.import_ c:var(--code-import-variable)
	.variable_.root_ c:var(--code-root-variable)
	.special_,.special c:#fffab4
	.entity.name.constructor c:var(--code-keyword)
	
	.blockparam c:var(--code-operator)

	._do > .paren@first >
		c@first:var(--code-keyword)
		c@last:var(--code-keyword)

	.parameter_ + .paren >
		c@first:var(--code-variable)
		c@last:var(--code-variable)
	
	.variable_ + .paren >
		c@first:var(--code-variable)
		c@last:var(--code-variable)

	.global_ + .paren >
		c@first:var(--code-global-variable)
		c@last:var(--code-global-variable)

	.keyword.import + .paren > .paren
		c:var(--code-keyword)

	.path c:var(--code-string)
	.entity,.field c:var(--code-entity)

	.__ref.highlight
		bg:rgba(255, 253, 227, 0.11)
		box-shadow:0px 0px 0px 2px rgba(255, 253, 227, 0.11)
		border-radius:3px
		transition: all 0.15s

	.region.hl2
		bg:rgba(0, 0, 0, 0.11)
		box-shadow:0px 0px 0px 2px rgba(0, 0, 0, 0.11)
		border-radius:3px
		transition: all 0.15s

	.region pos:relative

	& .region.arrow@before
		content: " "
		pos:absolute d:block
		size:16px
		bg: url(./assets/arrow.svg)
		background-size: contain
		bottom:100% right:50% mr:-2px mb:-2px

	.css.attribute.name color:var(--code-style-property)
	.css.attribute.value color:var(--code-style-value)