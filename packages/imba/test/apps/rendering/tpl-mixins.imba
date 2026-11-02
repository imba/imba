# CSS mixins (`%name`) on elements in templates, paired with `%name`
# style rules declared at file level, in tag bodies and in css blocks

# file-level mixin declaration (block form)
%stamp
	fw:700 c:rgb(0,0,255)

# file-level css rule that targets a mixin inside a class
css .wrap %stamp td:underline

def color el
	window.getComputedStyle(el).color

def weight el
	window.getComputedStyle(el).fontWeight

tag mix-child
	<self>
		<b%stamp> "child"

tag mix-basic
	flag = no
	kind = 'one'

	# mixin declared directly in the tag body
	%name fw:500 fs:18px

	# mixins declared inside css blocks
	css %title c:rgb(255,0,0)
	css %row d:flex g:3px
	css .holder %name c:rgb(0,128,0)

	<self>
		<div$plain%name> "name"
		<$bare%title> "title"
		<div$combo.cls%name%title[w:11px]> "combo"
		<span$row%row.extra> "row"
		<mix-child$custom%name>
		<div$flagged%name .on=flag> "flagged"
		<div$dyn%title .{kind}> "dyn"
		<.holder> <span$nested%name> "nested"
		<.wrap> <span$wrapped%stamp> "wrapped"
		<i$global%stamp> "global"

# top-level describes clear document.body when they finish,
# so every group mounts its own instance
describe "mixin classes on elements" do
	let app = imba.mount <mix-basic>

	test "<div%name> adds the mixin as a class" do
		let el = app.$plain
		eq el.nodeName, 'DIV'
		assert el.classList.contains('%name')
		eq el.textContent, 'name'

	test "<%name> defaults to a div" do
		let el = app.$bare
		eq el.nodeName, 'DIV'
		assert el.classList.contains('%title')

	test "classes, multiple mixins and inline styles combine" do
		let el = app.$combo
		assert el.classList.contains('cls')
		assert el.classList.contains('%name')
		assert el.classList.contains('%title')
		eq window.getComputedStyle(el).width, '11px'

	test "mixin followed by a class" do
		let el = app.$row
		eq el.nodeName, 'SPAN'
		assert el.classList.contains('%row')
		assert el.classList.contains('extra')

	test "mixin on a custom element" do
		let el = app.$custom
		eq el.nodeName, 'MIX-CHILD'
		assert el.classList.contains('%name')
		eq el.textContent, 'child'

describe "mixin style rules apply" do
	let app = imba.mount <mix-basic>

	test "tag-body mixin declaration" do
		eq weight(app.$plain), '500'
		eq window.getComputedStyle(app.$plain).fontSize, '18px'

	test "css-block mixin declaration" do
		eq color(app.$bare), 'rgb(255, 0, 0)'

	test "multiple mixins all apply" do
		eq weight(app.$combo), '500'
		eq color(app.$combo), 'rgb(255, 0, 0)'

	test "mixin with layout properties" do
		eq window.getComputedStyle(app.$row).display, 'flex'
		eq window.getComputedStyle(app.$row).columnGap, '3px'

	test "mixin on a custom element gets its styles" do
		eq weight(app.$custom), '500'
		eq window.getComputedStyle(app.$custom).fontSize, '18px'

	test "descendant selector targeting a mixin" do
		eq color(app.$nested), 'rgb(0, 128, 0)'
		# the same mixin outside .holder keeps the default color
		assert color(app.$plain) != 'rgb(0, 128, 0)'

	test "file-level mixin declaration" do
		eq weight(app.$global), '700'
		eq color(app.$global), 'rgb(0, 0, 255)'

	test "file-level mixin used inside another tag" do
		let b = app.$custom.querySelector('b')
		assert b.classList.contains('%stamp')
		eq color(b), 'rgb(0, 0, 255)'

	test "file-level rule combining a class and a mixin" do
		eq window.getComputedStyle(app.$wrapped).textDecorationLine, 'underline'
		eq window.getComputedStyle(app.$global).textDecorationLine, 'none'

describe "mixins with dynamic flags" do
	let app = imba.mount <mix-basic>

	test "mixin is kept when a flag toggles" do
		let el = app.$flagged
		assert el.classList.contains('%name')
		assert !el.classList.contains('on')
		app.flag = yes
		app.render!
		assert el.classList.contains('%name')
		assert el.classList.contains('on')
		app.flag = no
		app.render!
		assert el.classList.contains('%name')
		assert !el.classList.contains('on')

	test "mixin is kept when an interpolated class changes" do
		let el = app.$dyn
		assert el.classList.contains('%title')
		assert el.classList.contains('one')
		app.kind = 'two'
		app.render!
		assert el.classList.contains('%title')
		assert el.classList.contains('two')
		assert !el.classList.contains('one')
		eq color(el), 'rgb(255, 0, 0)'

describe "mixins in functional templates" do
	tag mix-list
		items = ['a','b']

		%item c:rgb(255,0,255)

		def entry label
			<li%item> label

		<self>
			<ul> for item in items
				<entry(item)>

	test "mixin from a template method" do
		let el = imba.mount <mix-list>
		let lis = el.querySelectorAll('li')
		eq lis.length, 2
		assert lis[0].classList.contains('%item')
		eq color(lis[1]), 'rgb(255, 0, 255)'
		eq el.textContent, 'ab'
