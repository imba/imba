# Selector features: parent (^) and ancestor (..) modifiers, deep
# selectors (*, >>>, >>, self), negated media modifiers, @media(),
# container queries (@@size) and scroll-state modifiers.

def cs el
	window.getComputedStyle(el)

def fw el
	cs(el).fontWeight

def frames n = 2
	for i in [0 ... n]
		await new Promise do requestAnimationFrame($1)

def viewport width, height = 600
	await spec.page.setViewport(width: width, height: height)
	await frames!

tag sel-child
	<self>
		<div$foo.foo> 'foo'
		<div$bar.bar> 'bar'
		<div$baz.baz> 'baz'
		<div$stroke.stroke> 'stroke'
		<div$q.q> 'q'

tag Parents
	css .item o:0.5 ^@hover:1
	css .row .icon^@hover fw:700
	css .row .icon ^.on fw:600
	css .deep ^^.on fw:800
	css .box d:block ..editing:hcc
	css .flag d:block ..@suspended:none
	css .sel 1sel:0 .sel:0.25 .sel..@focus:1 o:calc(1sel)

	<self>
		<div$hover> <div$item.item>
		<div$row.row> <div$icon.icon>
		<div$row2.row.on> <div$icon2.icon>
		<div$gp.on> <div> <div$deep.deep>
		<div$p1.on> <div$notdeep.deep>
		<div$edit> <div$box.box>
		<div$susp> <div$flag.flag>
		<div$focus> <div$sel.sel>

tag Outlined
	<self>
		<div$outline%outline>
			css o:0.3
				^@hover o:0.7
				^.selected o:0

tag Deep
	css .foo fw:300
	css >>> .bar fw:700
	css * .baz fw:600
	css .h1 *.stroke fw:800
	css .p * .q fw:500
	css >> .direct fw:900
	css .outer self c:rgb(0 0 255)
	css >>> .x .y fw:200

	<self>
		<sel-child$child>
		<div.h1> <sel-child$h1child>
		<div.p> <sel-child$pchild>
		<div$direct.direct>
		<div> <div$indirect.direct>
		<div.x> <div$xy.y>

tag Media
	css .neg fw:400 @!md:700
	css .negdark fw:400 @!dark:600
	css .lt fw:400 @lt-md:800
	css .print fw:400 @print:900
	css .row
		* fl@!md:1 fw@!md:300
	css .mq
		fw:400
		@media(max-width:520px) fw:500

	<self>
		<div$neg.neg>
		<div$negdark.negdark>
		<div$lt.lt>
		<div$print.print>
		<div$row.row[d:flex]> <div$cell>
		<div$mq.mq>

tag Containers
	css .item fw:400 @@400:700 @@!200:300
	css .grid
		.cell
			gc:span 1
			@@500 gc:span 2
	css @@!150 fw:800

	<self>
		<div$wide[container-type:inline-size w:450px]> <div$witem.item>
		<div$mid[container-type:inline-size w:300px]> <div$mitem.item>
		<div$small[container-type:inline-size w:150px]> <div$sitem.item>
		<div$gridbox[container-type:inline-size w:600px]>
			<div.grid[d:grid gtc:4]>
				<div$cell.cell>
		<div$named[container:card / inline-size w:350px]> <div$nitem.item>
		<div$tiny[container-type:inline-size w:100px]>

tag ScrollState
	css .marker fw:400 @scrollable-top:700
	css .label fw:400 @stuck-top:600

	<self>
		<div$scroller[container-type:scroll-state ofy:auto h:50px w:100px]>
			<div$marker.marker> 'marker'
			<div[h:300px]>
		<div$scroller2[ofy:auto h:50px w:100px pos:relative]>
			<div[h:20px]>
			<div$sticky[pos:sticky t:0 container-type:scroll-state h:10px]>
				<div$label.label> 'label'
			<div[h:300px]>

describe 'parent and ancestor modifiers' do
	let el = imba.mount <Parents>

	test '^@hover on a property' do
		eq cs(el.$item).opacity, '0.5'
		el.$hover.classList.add('@hover')
		eq cs(el.$item).opacity, '1'
		el.$hover.classList.remove('@hover')

	test 'modifier moved up to the previous part' do
		eq fw(el.$icon), '400'
		el.$row.classList.add('@hover')
		eq fw(el.$icon), '700'
		el.$row.classList.remove('@hover')

	test 'parent class as a separate part' do
		eq fw(el.$icon2), '600'

	test '^^ targets the grandparent' do
		eq fw(el.$deep), '800'
		eq fw(el.$notdeep), '400'

	test '..class with a layout value' do
		eq cs(el.$box).display, 'block'
		el.$edit.classList.add('editing')
		eq cs(el.$box).display, 'flex'
		eq cs(el.$box).justifyContent, 'center'
		el.$edit.classList.remove('editing')

	test '..@state ancestor flag' do
		eq cs(el.$flag).display, 'block'
		el.$susp.classList.add('@suspended')
		eq cs(el.$flag).display, 'none'
		el.$susp.classList.remove('@suspended')

	test 'custom unit with class and ancestor modifiers' do
		eq cs(el.$sel).opacity, '0.25'
		el.$focus.classList.add('@focus')
		eq cs(el.$sel).opacity, '1'
		el.$focus.classList.remove('@focus')

describe 'parent modifiers in nested blocks' do
	let el = imba.mount <Outlined>

	test '^@hover and ^.class inside an element css block' do
		eq cs(el.$outline).opacity, '0.3'
		el.classList.add('@hover')
		eq cs(el.$outline).opacity, '0.7'
		el.classList.add('selected')
		eq cs(el.$outline).opacity, '0'

describe 'deep selectors' do
	let el = imba.mount <Deep>

	test 'plain selectors stay scoped to the component' do
		eq fw(el.$child.$foo), '400'

	test '>>> reaches into child components' do
		eq fw(el.$child.$bar), '700'

	test 'leading * escapes the scope' do
		eq fw(el.$child.$baz), '600'

	test '*.class pierces a child component under a scoped part' do
		eq fw(el.$h1child.$stroke), '800'
		eq fw(el.$child.$stroke), '400'

	test '* between parts' do
		eq fw(el.$pchild.$q), '500'
		eq fw(el.$child.$q), '400'

	test '>> only matches direct children' do
		eq fw(el.$direct), '900'
		eq fw(el.$indirect), '400'

	test 'self after an outer selector' do
		eq cs(el).color, 'rgb(0, 0, 0)'
		document.body.classList.add('outer')
		eq cs(el).color, 'rgb(0, 0, 255)'
		document.body.classList.remove('outer')

	test 'unscoped descendant chain' do
		eq fw(el.$xy), '200'

describe 'media modifiers' do
	let el = imba.mount <Media>

	test 'negated breakpoint does not match above it' do
		await viewport(800)
		eq fw(el.$neg), '400'
		eq fw(el.$lt), '400'
		eq fw(el.$cell), '400'

	test 'negated breakpoint matches below it' do
		await viewport(800)
		await viewport(700)
		eq fw(el.$neg), '700'
		eq fw(el.$lt), '800'
		eq fw(el.$cell), '300'
		eq cs(el.$cell).flexGrow, '1'
		await viewport(800)
		eq fw(el.$neg), '400'

	test 'negated color scheme' do
		# headless chromium prefers the light color scheme
		eq fw(el.$negdark), '600'

	test 'print media' do
		eq fw(el.$print), '400'

	test '@media() with a raw query' do
		await viewport(800)
		eq fw(el.$mq), '400'
		await viewport(500)
		eq fw(el.$mq), '500'
		await viewport(800)
		eq fw(el.$mq), '400'

describe 'container queries' do
	let el = imba.mount <Containers>

	test '@@size matches containers at least that wide' do
		eq fw(el.$witem), '700'
		eq fw(el.$mitem), '400'

	test '@@!size matches containers narrower than size' do
		eq fw(el.$sitem), '300'

	test 'container query in a nested rule' do
		eq cs(el.$cell).gridColumnStart, 'span 2'
		el.$gridbox.style.width = '400px'
		eq cs(el.$cell).gridColumnStart, 'span 1'
		el.$gridbox.style.width = ''

	test 'top level container query on the component' do
		eq fw(el), '400'
		let probe = <Containers>
		el.$tiny.appendChild(probe)
		eq fw(probe), '800'
		probe.remove!

	test 'named container shorthand' do
		eq cs(el.$named).containerName, 'card'
		eq cs(el.$named).containerType, 'inline-size'
		# unnamed @@ queries match the nearest container of any name
		eq fw(el.$nitem), '400'

describe 'scroll-state modifiers' do
	let el = imba.mount <ScrollState>

	test '@scrollable-top' do
		await frames!
		eq fw(el.$marker), '400'
		el.$scroller.scrollTop = 100
		await frames(3)
		eq fw(el.$marker), '700'

	test '@stuck-top' do
		await frames!
		eq fw(el.$label), '400'
		el.$scroller2.scrollTop = 100
		await frames(3)
		eq fw(el.$label), '600'
