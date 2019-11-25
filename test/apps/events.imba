var items = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
]

tag nested-item

	def ping ref
		console.info("nested-{ref}")

tag app-root

	def ping ref
		console.info(ref)

	def call item
		console.info(item)

	def render
		<self>
			<div.a :click.ping(:a)>
				<button.b :click.ping(:b)> "b"
				<button.c :click.stop.ping(:c)> "c"
				<button.d :click.self.stop.ping(:d) :click.ping(:de)>
					"self"
					<b> "inside"

				<button.e :click.stop.self.ping(:e)>
					"self"
					<b> "inside"

				<button.f :click.ping(:f1).ping(:f2)> "Multiple"
				<nested-item>
					<button.g :click.ping(:g)> 'g'

			<div.capturing :click.capture.ping(:captured)>
				<button :click.ping(:button)> 'button'

			<button.once :click.once(:once)> 'once button'

			<button.h :click.ping(:h)>
				"h"
				<nested-item> "nested"

			<button.i :click.ping(items[0].title)>
			
			<ul> for item,i in items
				<li :click.call(item)>

imba.mount(<app-root>)

var click = do |state,sel,result|
	state.log = []
	await spec.click(sel)
	eq(state.log.join(','),result)

test "click" do
	# click will cascade from button.b to div.a
	await click($1,'.b','b,a')

test "click.stop" do
	await click($1,'.c','c')

test "click.self" do
	await click($1,'.d','d')
	await click($1,'.d b','de,a')

test "stop even if not self" do
	await click($1,'.e','e')
	# button.e should stop the event but not execute ping
	# because we check self after stop
	await click($1,'.e b','')

test "multiple calls" do
	await click($1,'button.f','f1,f2,a')

test "dynamic arguments" do
	await click($1,'button.i','One')

test "click traversal" do
	await click($1,'.h','h')

test "intercepted method" do
	# we walk up the whole path of elements to find potential
	# handlers for our method. since button.g is inside nested-item
	# it will trigger the ping-method on this element instead
	await click($1,'button.g','nested-g,a')

test "click.once" do
	await click($1,'button.once','once')
	await click($1,'button.once','')

test "click.capture" do
	await click($1,'div.capturing button','captured,button')