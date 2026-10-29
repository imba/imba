# Functional slots: template methods (not `<self>` renders) that contain
# `<slot>`/`<slot name=..>` and are called as `<method(args)> children`.

tag fs-frame
	<self.frame> <slot>

tag fs-app
	label = 'A'
	items = ['x','y']
	show = yes
	count = 0

	def card title
		<section.card>
			<h2> title
			<div.body> <slot>

	def panel title
		<div.panel>
			<header> title
			<div.side> <slot name='side'>
			<div.main> <slot>

	def list items, tpl
		let has = items and items.length
		<div.list>
			<div.items> for item in items
				<(tpl.call(self,item)) key=item>
			<div.empty .hidden=has> <slot name='empty'>
			<slot>

	def row item
		<p.row> item

	def framed
		<fs-frame.framed>
			<b.pre> "pre"
			<slot>

	<self>
		<div$cards>
			<card(label)>
				<p.child> "child of {label}"
			<card("static")>
		<div$panels>
			<panel("P")>
				<i.main-child> "main"
				<em slot='side'> "side"
		<div$lists>
			<list(items,row)>
				<span.after> "after"
				<b slot='empty'> "nothing here"
		<div$framed>
			<framed()>
				<u> "inside"
		<div$conditional>
			<card("cond")>
				if show
					<p.maybe> "shown"
				<span.count> count

describe "functional slots" do
	let app = imba.mount <fs-app>

	test "default slot receives the children" do
		let card = app.$cards.querySelector('.card')
		eq card.querySelector('h2').textContent, 'A'
		let body = card.querySelector('.body')
		eq body.children.length, 1
		eq body.children[0].nodeName, 'P'
		eq body.textContent, 'child of A'

	test "the same method can be used without children" do
		let cards = app.$cards.querySelectorAll('.card')
		eq cards.length, 2
		eq cards[1].querySelector('h2').textContent, 'static'
		eq cards[1].querySelector('.body').children.length, 0

	test "re-rendering updates arguments and slotted content in place" do
		let card = app.$cards.querySelector('.card')
		let child = card.querySelector('.child')
		app.label = 'B'
		app.render!
		eq app.$cards.querySelector('.card'), card
		eq card.querySelector('h2').textContent, 'B'
		eq card.querySelector('.child'), child
		eq child.textContent, 'child of B'

	test "named and default slots in the same method" do
		let panel = app.$panels.querySelector('.panel')
		eq panel.querySelector('header').textContent, 'P'
		let side = panel.querySelector('.side')
		let main = panel.querySelector('.main')
		eq side.children.length, 1
		eq side.children[0].nodeName, 'EM'
		eq side.textContent, 'side'
		eq main.children.length, 1
		eq main.textContent, 'main'

	test "slots next to a keyed loop of dynamic templates" do
		let list = app.$lists.querySelector('.list')
		eq list.querySelector('.items').textContent, 'xy'
		eq list.querySelectorAll('.row').length, 2
		eq list.lastElementChild.nodeName, 'SPAN'
		eq list.lastElementChild.textContent, 'after'
		eq list.querySelector('.empty').textContent, 'nothing here'
		assert list.querySelector('.empty').classList.contains('hidden')

	test "keyed rows in the method keep identity on reorder" do
		let rows = Array.from(app.$lists.querySelectorAll('.row'))
		app.items = ['y','x']
		app.render!
		let now = Array.from(app.$lists.querySelectorAll('.row'))
		eq now[0], rows[1]
		eq now[1], rows[0]

	test "empty list toggles the empty-state flag" do
		app.items = []
		app.render!
		let list = app.$lists.querySelector('.list')
		eq list.querySelectorAll('.row').length, 0
		assert !list.querySelector('.empty').classList.contains('hidden')
		eq list.querySelector('.empty').textContent, 'nothing here'

	test "functional slot inside a component root" do
		let frame = app.$framed.querySelector('fs-frame')
		assert frame.classList.contains('framed')
		assert frame.classList.contains('frame')
		eq frame.textContent, 'preinside'
		eq frame.children[0].nodeName, 'B'
		eq frame.children[1].nodeName, 'U'

	test "conditional and dynamic content in a functional slot" do
		let body = app.$conditional.querySelector('.body')
		eq body.querySelectorAll('.maybe').length, 1
		eq body.querySelector('.count').textContent, '0'
		app.show = no
		app.count = 5
		app.render!
		eq body.querySelectorAll('.maybe').length, 0
		eq body.querySelector('.count').textContent, '5'
		app.show = yes
		app.render!
		eq body.querySelectorAll('.maybe').length, 1
		eq body.firstElementChild.className.split(' ')[0], 'maybe'
