# Attributes in templates: attribute modifiers (`popup.modal`), aria/data/role,
# boolean values, bind with dynamic keys, conditional and interpolated
# inline styles, ids and empty style blocks.

const CONSTRAINTS = {
	echo: 'Echo cancellation'
	noise: 'Noise suppression'
	gain: 'Auto gain'
}

tag at-popup
	seen = []
	set popup value
		seen.push([value, self.popup__])
	set tip value
		seen.push([value, self.tip__])
	set opnav value
		seen.push([value, self.opnav__])

tag at-app
	label = 'hello'
	hit = yes
	busy = no
	items = ['a','b']
	constraints = {echo: yes, noise: no, gain: no}
	collapsed = no
	depth = 2
	name = 'main'

	def render
		let level = depth + 1
		<self>
			<at-popup$popup popup.modal tip.right=label opnav.area.list>
			<div$plain popup.modal>
			<ul$list role='list'> for item,i in items
				<li role='listitem' aria-disabled=(!hit) data-index=i aria-label="item {item}"> item
			<button$btn disabled=busy hidden=no aria-busy=busy> "go"
			<div$checks> for own key,text of CONSTRAINTS
				<label> <input type='checkbox' bind=constraints[key] /> text
			<div$levels> for item,i in items
				<div.level[$level:{i} w:{depth * 10 + i}px $outer:{level}]> item
			<div$cssbody> for item,i in items
				let w = (i + 1) * depth
				<div.cell>
					css w:{w}px h:{i + 1}px
					item
			<div$toggle [d:none]=collapsed> "toggle"
			<div$empty[]> "empty style"
			<div#main> "by id"
			<input#check type='checkbox'>
			<section$dyn id=name> "dynamic id"

describe "attribute modifiers" do
	let app = imba.mount <at-app>

	test "modifiers are available to setters on custom elements" do
		let seen = app.$popup.seen
		let popup = seen.find(do $1[0] == 'popup')
		assert !!popup
		eq popup[1], {modal: true}

	test "attribute modifier with a value" do
		let tip = app.$popup.seen.find(do $1[0] == 'hello')
		assert !!tip
		eq tip[1], {right: true}

	test "chained attribute modifiers" do
		let nav = app.$popup.seen.find(do $1[0] == 'opnav')
		assert !!nav
		eq nav[1], {area: true, list: true}

	test "dynamic value with modifiers updates" do
		app.$popup.seen = []
		app.label = 'world'
		app.render!
		eq app.$popup.seen, [['world', {right: true}]]
		app.render!
		eq app.$popup.seen.length, 1

	test "modifiers on a plain element" do
		eq app.$plain.popup__, {modal: true}

describe "aria, data and role attributes" do
	let app = imba.mount <at-app>

	test "static role attributes" do
		eq app.$list.getAttribute('role'), 'list'
		let li = app.$list.children[0]
		eq li.getAttribute('role'), 'listitem'

	test "dynamic aria and data attributes" do
		let [a,b] = Array.from(app.$list.children)
		eq a.getAttribute('aria-disabled'), 'false'
		eq a.getAttribute('aria-label'), 'item a'
		eq b.getAttribute('aria-label'), 'item b'
		eq a.dataset.index, '0'
		eq b.dataset.index, '1'

	test "dynamic aria attributes update" do
		app.hit = no
		app.items = ['x','b']
		app.render!
		let a = app.$list.children[0]
		eq a.getAttribute('aria-disabled'), 'true'
		eq a.getAttribute('aria-label'), 'item x'

	test "boolean properties" do
		eq app.$btn.disabled, false
		eq app.$btn.hidden, false
		eq app.$btn.getAttribute('aria-busy'), 'false'
		app.busy = yes
		app.render!
		eq app.$btn.disabled, true
		assert app.$btn.hasAttribute('disabled')
		eq app.$btn.getAttribute('aria-busy'), 'true'

describe "bind with a dynamic key" do
	let app = imba.mount <at-app>

	test "renders one bound checkbox per key" do
		let inputs = app.$checks.querySelectorAll('input')
		eq inputs.length, 3
		eq inputs[0].checked, true
		eq inputs[1].checked, false
		eq app.$checks.children[1].textContent, 'Noise suppression'

	test "toggling a checkbox writes to the keyed property" do
		let inputs = app.$checks.querySelectorAll('input')
		inputs[1].click!
		await imba.commit!
		eq app.constraints.noise, true
		inputs[0].click!
		await imba.commit!
		eq app.constraints.echo, false
		eq app.constraints.gain, false

	test "changing the bound object updates the checkboxes" do
		app.constraints = {echo: no, noise: no, gain: yes}
		app.render!
		let inputs = app.$checks.querySelectorAll('input')
		eq inputs[0].checked, false
		eq inputs[2].checked, true
		inputs[2].click!
		await imba.commit!
		eq app.constraints.gain, false

describe "bind inside a template method" do
	tag at-form
		query = 'abc'

		def search-field
			<input.search type='text' bind=query>

		<self>
			<div> <search-field()>

	let app = imba.mount <at-form>

	test "reads the bound value" do
		let input = app.querySelector('.search')
		eq input.value, 'abc'

	test "writes back on input" do
		let input = app.querySelector('.search')
		input.value = 'xyz'
		input.dispatchEvent(new Event('input'))
		await imba.commit!
		eq app.query, 'xyz'

describe "inline styles" do
	let app = imba.mount <at-app>

	test "interpolated values from loop variables" do
		let levels = app.$levels.children
		eq window.getComputedStyle(levels[0]).width, '20px'
		eq window.getComputedStyle(levels[1]).width, '21px'
		eq window.getComputedStyle(levels[1]).getPropertyValue('--level').trim!, '1'
		eq window.getComputedStyle(levels[1]).getPropertyValue('--outer').trim!, '3'

	test "interpolated values update on render" do
		app.depth = 5
		app.render!
		eq window.getComputedStyle(app.$levels.children[1]).width, '51px'
		eq window.getComputedStyle(app.$levels.children[1]).getPropertyValue('--outer').trim!, '6'

	test "css block in a tag body with interpolated locals" do
		app.depth = 2
		app.render!
		let cells = app.$cssbody.children
		eq cells.length, 2
		eq window.getComputedStyle(cells[0]).width, '2px'
		eq window.getComputedStyle(cells[1]).width, '4px'
		eq window.getComputedStyle(cells[1]).height, '2px'
		eq cells[1].textContent, 'b'
		app.depth = 10
		app.render!
		eq window.getComputedStyle(cells[1]).width, '20px'
		eq window.getComputedStyle(cells[1]).height, '2px'

	test "conditional inline style" do
		eq window.getComputedStyle(app.$toggle).display, 'block'
		app.collapsed = yes
		app.render!
		eq window.getComputedStyle(app.$toggle).display, 'none'
		app.collapsed = no
		app.render!
		eq window.getComputedStyle(app.$toggle).display, 'block'

	test "empty inline style block" do
		eq app.$empty.textContent, 'empty style'
		eq app.$empty.getAttribute('style'), null

describe "ids" do
	let app = imba.mount <at-app>

	test "static ids" do
		eq app.querySelector('#main').textContent, 'by id'
		eq app.querySelector('#check').type, 'checkbox'

	test "dynamic id attribute" do
		eq app.$dyn.id, 'main'
		app.name = 'other'
		app.render!
		eq app.$dyn.id, 'other'
