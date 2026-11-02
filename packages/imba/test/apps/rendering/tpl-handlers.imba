# Event handler callbacks in templates: `do` blocks, calls with arguments,
# bare method references, refs, modifiers and custom events.

const KEYCODES = {Enter: 13, a: 65}

def keydown el, key
	let ev = new KeyboardEvent('keydown', key: key, keyCode: KEYCODES[key], bubbles: yes, cancelable: yes)
	el.dispatchEvent(ev)
	return ev

tag h-nav
	hides = 0
	def hide e
		hides++ if e isa Event

tag h-app
	count = 0
	last = null
	log = []
	bookmarked = no
	query = 'abc'

	def hit val = 1
		count += val

	def record e
		log.push(e.type) if e isa Event

	def bookmark
		bookmarked = yes

	def unbookmark
		bookmarked = no

	def use q
		log.push("use:{q}")

	<self @picked=(last = e.detail) @done.trap.log('handled')=(log.push("done:{e.detail}"))>
		<h-nav$nav>
		<button$doIncr @click=(do count++)> "a"
		<button$doParam @click=(do(e) last = e.type)> "b"
		<button$doMulti @click=(do count = 10; last = 'multi')> "c"
		<button$doTernary @click.stop=(do bookmarked ? unbookmark! : bookmark!)> "d"
		<button$callArgs @click=hit(5)> "e"
		<button$callBare @click=record> "f"
		<button$callRef @click=$nav.hide> "g"
		<button$expr @click=(count += 2)> "h"
		<input$enter value=query @keydown.enter.prevent=use(query)>
		<button$emit @click.emit('picked', 'payload')> "i"
		<button$emitIf @click.if(count > 100).emit('picked', 'big')> "j"
		<div$custom @custom=(last = e.detail)>

describe "handler callbacks" do
	let app = imba.mount <h-app>

	def reset
		app.count = 0
		app.last = null
		app.log = []

	test "do block as handler" do
		reset!
		app.$doIncr.click!
		app.$doIncr.click!
		eq app.count, 2

	test "do block with an event parameter" do
		reset!
		app.$doParam.click!
		eq app.last, 'click'

	test "do block with several statements" do
		reset!
		app.$doMulti.click!
		eq app.count, 10
		eq app.last, 'multi'

	test "do block with a ternary of method calls" do
		app.bookmarked = no
		app.$doTernary.click!
		eq app.bookmarked, true
		app.$doTernary.click!
		eq app.bookmarked, false

	test "method call with arguments" do
		reset!
		app.$callArgs.click!
		app.$callArgs.click!
		eq app.count, 10

	test "bare method reference is called with the event" do
		reset!
		app.$callBare.click!
		eq app.log, ['click']

	test "method on a ref is called with the event" do
		app.$nav.hides = 0
		app.$callRef.click!
		eq app.$nav.hides, 1

	test "plain expression as handler" do
		reset!
		app.$expr.click!
		app.$expr.click!
		eq app.count, 4

	test "key modifier with arguments from render scope" do
		reset!
		keydown(app.$enter, 'a')
		eq app.log, []
		keydown(app.$enter, 'Enter')
		eq app.log, ['use:abc']

	test "key modifier picks up re-rendered arguments" do
		reset!
		app.query = 'xyz'
		app.render!
		keydown(app.$enter, 'Enter')
		eq app.log, ['use:xyz']

	test "prevent modifier" do
		let ev = keydown(app.$enter, 'Enter')
		eq ev.defaultPrevented, true
		eq keydown(app.$enter, 'a').defaultPrevented, false

	test "emit modifier triggers a custom event on the parent" do
		reset!
		app.$emit.click!
		eq app.last, 'payload'

	test "if modifier guards the rest of the chain" do
		reset!
		app.$emitIf.click!
		eq app.last, null
		app.count = 200
		app.render!
		app.$emitIf.click!
		eq app.last, 'big'

	test "custom events with e.detail" do
		reset!
		app.$custom.emit('custom', 42)
		eq app.last, 42

	test "trap and log modifiers before a callback" do
		reset!
		app.$custom.emit('done', 'x')
		eq app.log, ['done:x']

describe "handlers in loops and template methods" do
	tag h-list
		items = ['a','b','c']
		picked = []

		def select item
			picked.push(item)

		def action label
			<button.action @click=(do picked.push("action:{label}"))> label

		<self>
			<ul> for item,i in items
				<li @click=select("{i}:{item}")> item
			<div$actions>
				<action('one')>
				<action('two')>

	let app = imba.mount <h-list>

	test "handler arguments use the loop values" do
		let lis = app.querySelectorAll('li')
		lis[2].click!
		lis[0].click!
		eq app.picked, ['2:c','0:a']

	test "loop handlers see updated items" do
		app.picked = []
		app.items = ['x','y']
		app.render!
		app.querySelectorAll('li')[1].click!
		eq app.picked, ['1:y']

	test "handlers on elements returned from template methods" do
		app.picked = []
		let buttons = app.$actions.querySelectorAll('.action')
		eq buttons.length, 2
		buttons[1].click!
		buttons[0].click!
		eq app.picked, ['action:two','action:one']
