# Declaring %mixin rules on the CSS side: file level `css %name` blocks,
# bare `%name` declarations at file level and inside tag bodies, %names
# nested in css blocks and global css, and combining several mixins.

def cs el
	window.getComputedStyle(el)

def fw el
	cs(el).fontWeight

css %noise bg:rgb(255 0 0)
css .wrap %item fw:600

%card p:2 fw:500
	.title fw:700
	@hover c:rgb(0 0 255)

%pill rd:full px:2 fw:300

export %exported fw:650

global css %gbadge fw:800

global css mixin-tile
	%title c@important:rgb(0 128 0)
	%tab fw:300
	%tab.active fw:700
	%bottom h2 c:rgb(0 0 255)

tag mixin-tile
	<self>
		<div$title%title[c:red]> 'title'
		<div$tab%tab> 'tab'
		<div$active%tab.active> 'active'
		<div$bottom%bottom> <h2$h2> 'h2'

tag Mixins
	css @important mih:50px
		%foot d:hflex jc:space-between
		%foot button tt:uppercase
		%dot w:10px h:10px bg:rgb(0 0 0) @hover:rgb(0 0 255)
		%dot.active bg:rgb(255 0 0)

	def as-tab
		<div> "tab"

	%name fw:500 fs:18px

	<self>
		<div$noise%noise>
		<div.wrap> <div$item%item>
		<div$item2%item>
		<div$card%card> <div$cardtitle.title>
		<div$pill%pill>
		<div$both%card%pill>
		<div$both2%pill%card>
		<div$exported%exported>
		<div$gbadge%gbadge>
		<div$foot%foot> <button$footbtn> 'go'
		<div$dot%dot>
		<div$dotactive%dot.active>
		<div$name%name> 'name'
		<div$tree>
			css %container d:hcl g:4
			<div$container%container>
		<mixin-tile$tile>

describe 'mixins declared with css %name' do
	let el = imba.mount <Mixins>

	test 'file level css %name' do
		eq cs(el.$noise).backgroundColor, 'rgb(255, 0, 0)'

	test 'mixin as part of a descendant selector' do
		eq fw(el.$item), '600'
		eq fw(el.$item2), '400'

	test 'css %name inside the tag tree' do
		eq cs(el.$container).display, 'flex'
		eq cs(el.$container).alignItems, 'center'
		eq cs(el.$container).columnGap, '16px'

describe 'bare %name declarations' do
	let el = imba.mount <Mixins>

	test 'file level declaration' do
		eq cs(el.$card).paddingTop, '8px'
		eq fw(el.$card), '500'

	test 'nested selectors in a declaration' do
		eq fw(el.$cardtitle), '700'

	test 'modifiers in a declaration' do
		eq cs(el.$card).color, 'rgb(0, 0, 0)'
		el.$card.classList.add('@hover')
		eq cs(el.$card).color, 'rgb(0, 0, 255)'
		el.$card.classList.remove('@hover')

	test 'exported declaration' do
		eq fw(el.$exported), '650'

	test 'declaration in a tag body after a method' do
		eq fw(el.$name), '500'
		eq cs(el.$name).fontSize, '18px'

describe 'combining mixins' do
	let el = imba.mount <Mixins>

	test 'both mixins apply' do
		eq cs(el.$both).paddingTop, '8px'
		eq cs(el.$both).borderTopLeftRadius, '9999px'
		eq cs(el.$both).paddingLeft, '8px'

	test 'later declaration wins regardless of order on the element' do
		eq fw(el.$both), '300'
		eq fw(el.$both2), '300'

describe 'mixins in css blocks' do
	let el = imba.mount <Mixins>

	test 'nested %name with @important' do
		eq cs(el.$foot).display, 'flex'
		eq cs(el.$foot).justifyContent, 'space-between'

	test '%name followed by a descendant' do
		eq cs(el.$footbtn).textTransform, 'uppercase'

	test '%name with a modifier' do
		eq cs(el.$dot).backgroundColor, 'rgb(0, 0, 0)'
		el.$dot.classList.add('@hover')
		eq cs(el.$dot).backgroundColor, 'rgb(0, 0, 255)'

	test '%name combined with a class' do
		eq cs(el.$dotactive).backgroundColor, 'rgb(255, 0, 0)'

	test 'global %name' do
		eq fw(el.$gbadge), '800'

describe 'mixins in global css' do
	let el = imba.mount <Mixins>

	test '%name with @important under a tag selector' do
		eq cs(el.$tile.$title).color, 'rgb(0, 128, 0)'

	test '%name combined with a class' do
		eq fw(el.$tile.$tab), '300'
		eq fw(el.$tile.$active), '700'

	test '%name followed by a descendant' do
		eq cs(el.$tile.$h2).color, 'rgb(0, 0, 255)'
