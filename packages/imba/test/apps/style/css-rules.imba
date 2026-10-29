# Rule-level behaviours: helper rules (transform/outline/ease) wrapped in
# media queries, merged duplicate nested selectors, custom units with
# modifier values, multi-property aliases, radius/border shorthands with
# zero, ::pseudo-element blocks, @off size rules, conditional style flags
# and top level @media/@container/scroll-state rules.

def cs el, pseudo = null
	window.getComputedStyle(el,pseudo)

def prop el, name
	cs(el).getPropertyValue(name).trim!

def frames n = 2
	for i in [0 ... n]
		await new Promise do requestAnimationFrame($1)

def viewport width, height = 600
	await spec.page.setViewport(width: width, height: height)
	await frames!

global css @root
	$border-radius-pill:999px

let flagged = yes

tag Helpers
	css .only-md x@md:10px
	css .both x:5px @md:10px
	css .olmd ol@md:red
	css .eamd ea@md:100ms
	css .zmd z@md:3px

	<self>
		<div$onlymd.only-md>
		<div$both.both>
		<div$olmd.olmd>
		<div$eamd.eamd>
		<div$zmd.zmd>

tag Rules
	css .twice
		@hover fw:600
		@hover c:rgb(255 0 0)
		.inner fw:300
		.inner c:rgb(0 0 255)
	css .units 1gap:10px .wide:20px @lg:30px
		w:2gap
	css .ja d:flex j:center a:flex-end
	css .pill rd:pill
	css .zero bd:1px solid red bd:0
	css .zero-ol ol:2px solid red ol:0
	css .zero-side bdb:2px solid red bdb:0
	css input
		::placeholder c:rgb(0 128 0)
	css .pseudo
		::before content:"x" fw:700
		::after content:"y"
	css .sized h:20px
		@off h:0px o:0
	css .imp fw:300
		@important fw:900

	<self>
		<div$twice.twice> <div$inner.inner>
		<div$units.units>
		<div$wide.units.wide>
		<div$ja.ja>
		<div$pill.pill[w:100px h:10px]>
		<div$rdparent[rd:6px]> <div$rdchild[rd:inherit]>
		<div$zero.zero>
		<div$zerool.zero-ol>
		<div$zeroside.zero-side>
		<input$input placeholder='type'>
		<div$pseudo.pseudo>
		<div$sized.sized>
		<div$imp.imp>
		<div$cond [fw:700]=flagged>
		<div$cond2.base[fw:300] [c:rgb(255 0 0)]=flagged>

tag TopLevel
	css @md fw:600
	css @@!600 c:rgb(0 128 0)
	css .s @scrollable-top fw:800

	<self>
		<div$scroller[container-type:scroll-state ofy:auto h:40px]>
			<div$s.s> 's'
			<div[h:200px]>

describe 'helper rules inside media queries' do
	let el = imba.mount <Helpers>

	test 'transform only inside a media query' do
		await viewport(800)
		eq new DOMMatrix(cs(el.$onlymd).transform).e, 10
		await viewport(700)
		eq cs(el.$onlymd).transform, 'none'
		await viewport(800)

	test 'transform with a media override' do
		await viewport(800)
		eq new DOMMatrix(cs(el.$both).transform).e, 10
		await viewport(700)
		eq new DOMMatrix(cs(el.$both).transform).e, 5
		await viewport(800)

	test 'outline only inside a media query' do
		await viewport(800)
		eq cs(el.$olmd).outlineColor, 'rgb(255, 0, 0)'
		eq cs(el.$olmd).outlineWidth, '1px'

	test 'ease only inside a media query' do
		await viewport(800)
		eq prop(el.$eamd,'--e_ad'), '100ms'
		await viewport(700)
		eq prop(el.$eamd,'--e_ad'), ''
		await viewport(800)

	test '3d transform only inside a media query' do
		await viewport(800)
		eq new DOMMatrix(cs(el.$zmd).transform).m43, 3

describe 'rules' do
	let el = imba.mount <Rules>

	test 'duplicate nested selectors are merged' do
		el.$twice.classList.add('@hover')
		eq cs(el.$twice).fontWeight, '600'
		eq cs(el.$twice).color, 'rgb(255, 0, 0)'
		el.$twice.classList.remove('@hover')
		eq cs(el.$inner).fontWeight, '300'
		eq cs(el.$inner).color, 'rgb(0, 0, 255)'

	test 'custom unit with modifier values' do
		await viewport(800)
		eq cs(el.$units).width, '20px'
		eq cs(el.$wide).width, '40px'

	test 'custom unit with a media modifier' do
		await viewport(1100)
		eq cs(el.$units).width, '60px'
		await viewport(800)

	test 'j and a set both justify and align properties' do
		eq cs(el.$ja).justifyContent, 'center'
		eq cs(el.$ja).justifyItems, 'center'
		eq cs(el.$ja).alignContent, 'flex-end'
		eq cs(el.$ja).alignItems, 'flex-end'

	test 'named radius reads --border-radius-name' do
		eq cs(el.$pill).borderTopLeftRadius, '999px'

	test 'rd:inherit is not turned into a radius variable' do
		eq cs(el.$rdchild).borderTopLeftRadius, '6px'

	test 'bd:0 resets the border' do
		eq cs(el.$zero).borderTopWidth, '0px'

	test 'ol:0 resets the outline width' do
		eq cs(el.$zerool).outlineWidth, '0px'

	test 'bdb:0 resets one side' do
		eq cs(el.$zeroside).borderBottomWidth, '0px'

	test '::placeholder block' do
		eq cs(el.$input,'::placeholder').color, 'rgb(0, 128, 0)'

	test '::before and ::after blocks' do
		eq cs(el.$pseudo,'::before').content, '"x"'
		eq cs(el.$pseudo,'::before').fontWeight, '700'
		eq cs(el.$pseudo,'::after').content, '"y"'

	test '@off size rules' do
		eq cs(el.$sized).height, '20px'
		el.$sized.classList.add('@off')
		eq cs(el.$sized).height, '0px'
		eq cs(el.$sized).opacity, '0'
		el.$sized.classList.remove('@off')

	test '@important nested block' do
		eq cs(el.$imp).fontWeight, '900'

	test 'conditional style flags' do
		eq cs(el.$cond).fontWeight, '700'
		eq cs(el.$cond2).color, 'rgb(255, 0, 0)'
		eq cs(el.$cond2).fontWeight, '300'
		flagged = no
		el.render!
		eq cs(el.$cond).fontWeight, '400'
		eq cs(el.$cond2).color, 'rgb(0, 0, 0)'
		eq cs(el.$cond2).fontWeight, '300'
		flagged = yes
		el.render!
		eq cs(el.$cond).fontWeight, '700'

describe 'top level nesting rules' do
	let el = imba.mount <TopLevel>

	test '@media on the component' do
		await viewport(800)
		eq cs(el).fontWeight, '600'
		await viewport(700)
		eq cs(el).fontWeight, '400'
		await viewport(800)

	test '@@!size on the component' do
		eq cs(el).color, 'rgb(0, 0, 0)'
		let box = <div[container-type:inline-size w:300px]>
		document.body.appendChild(box)
		let inner = <TopLevel>
		box.appendChild(inner)
		eq cs(inner).color, 'rgb(0, 128, 0)'
		box.remove!

	test 'scroll-state on a selector' do
		await frames!
		eq cs(el.$s).fontWeight, '600'
		el.$scroller.scrollTop = 50
		await frames(3)
		eq cs(el.$s).fontWeight, '800'
