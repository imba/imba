# Self-closing tags (`<tag/>`, `<tag />`). Anything that follows the `/>` on
# the same line is rendered as a sibling inside the parent, not as a child.

tag sc-icon
	<self> "[{data}]"

tag sc-empty
	<self.empty>

tag sc-app
	checked = no
	label = "Remember me"
	name = "abc"

	<self>
		<div$plain>
			<input/>
			<br/>
			<sc-empty/>
		<div$spaced>
			<input />
			<div.x />
			<span.a.b title='t' />
		<label$label> <input type='checkbox' bind=checked /> label
		<li$item> <sc-icon data='eye' /> "text"
		<p$static> <sc-icon data=name/> "after"
		<div$body.ob> <$surface.tracked /> <$inner> "in"
		<div$attrs> <input type='text' value=name placeholder="Name" />

describe "self-closing tags" do
	let app = imba.mount <sc-app>

	test "<tag/> without a space" do
		let el = app.$plain
		eq el.children.length, 3
		eq el.children[0].nodeName, 'INPUT'
		eq el.children[1].nodeName, 'BR'
		eq el.children[2].nodeName, 'SC-EMPTY'
		eq el.children[0].children.length, 0
		assert el.children[2].classList.contains('empty')

	test "<tag /> with a space, classes and attributes" do
		let el = app.$spaced
		eq el.children.length, 3
		eq el.children[0].nodeName, 'INPUT'
		eq el.children[1].nodeName, 'DIV'
		assert el.children[1].classList.contains('x')
		eq el.children[1].childNodes.length, 0
		let span = el.children[2]
		assert span.classList.contains('a')
		assert span.classList.contains('b')
		eq span.title, 't'
		eq span.childNodes.length, 0

	test "content after /> becomes a sibling" do
		let el = app.$label
		eq el.children.length, 1
		let input = el.children[0]
		eq input.nodeName, 'INPUT'
		eq input.type, 'checkbox'
		eq input.childNodes.length, 0
		eq el.textContent, 'Remember me'
		eq el.lastChild.nodeType, 3

	test "bind on a self-closing input" do
		let input = app.$label.querySelector('input')
		eq input.checked, false
		input.click!
		await imba.commit!
		eq app.checked, true
		app.checked = no
		app.render!
		eq input.checked, false

	test "dynamic text after /> updates in place" do
		let text = app.$label.lastChild
		app.label = "Stay signed in"
		app.render!
		eq app.$label.textContent, 'Stay signed in'
		eq app.$label.lastChild, text
		eq app.$label.children.length, 1

	test "self-closing component followed by static text" do
		let el = app.$item
		eq el.children.length, 1
		eq el.children[0].nodeName, 'SC-ICON'
		eq el.children[0].textContent, '[eye]'
		eq el.textContent, '[eye]text'

	test "self-closing component with a dynamic prop" do
		let el = app.$static
		eq el.textContent, '[abc]after'
		app.name = 'xyz'
		app.render!
		eq el.textContent, '[xyz]after'
		eq el.children.length, 1

	test "self-closing between nested inline tags" do
		let el = app.$body
		assert el.classList.contains('ob')
		eq el.children.length, 2
		eq el.children[0], app.$surface
		eq el.children[1], app.$inner
		assert app.$surface.classList.contains('tracked')
		eq app.$surface.childNodes.length, 0
		eq app.$inner.textContent, 'in'

	test "self-closing input with attributes" do
		let input = app.$attrs.children[0]
		eq app.$attrs.children.length, 1
		eq input.type, 'text'
		eq input.value, 'xyz'
		eq input.placeholder, 'Name'

describe "self-closing tags in loops and conditionals" do
	tag sc-list
		items = ['a','b','c']
		show = yes
		<self>
			<ul> for item in items
				<li> <sc-icon data=item /> item
			if show
				<hr/>
			else
				<sc-empty/>

	let app = imba.mount <sc-list>

	test "self-closing inside a loop" do
		let lis = app.querySelectorAll('li')
		eq lis.length, 3
		eq lis[0].children.length, 1
		eq lis[0].textContent, '[a]a'
		eq lis[2].textContent, '[c]c'

	test "loop updates keep the sibling structure" do
		app.items = ['x','y']
		app.render!
		let lis = app.querySelectorAll('li')
		eq lis.length, 2
		eq lis[1].textContent, '[y]y'
		eq lis[1].children.length, 1

	test "self-closing tags as conditional branches" do
		assert !!app.querySelector('hr')
		assert !app.querySelector('sc-empty')
		app.show = no
		app.render!
		assert !app.querySelector('hr')
		assert !!app.querySelector('sc-empty')
