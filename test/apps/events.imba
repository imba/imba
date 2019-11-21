tag app-root < component

	def ping name
		console.info(name)

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

document.body.appendChild(<app-root>)

var click = do |state,sel,result|
	state.log = []
	await spec.click(sel)
	eq(state.log.join(','),result)

test "click" do
	# click will cascade from button.b to div.a
	await click($1,'.b','b,a')

test "click.stop" do
	await click($1,'.c','c')
	# button.c stops the event from travelling up to div.a
	# await spec.click('.c')
	# eq $1.log,['c']

test "click.self" do
	await click($1,'.d','d')
	await click($1,'.d b','de,a')
	# button.c stops the event from travelling up to div.a
	# await spec.click('.c')
	# eq $1.log,['c']

test "stop even if not self" do
	await click($1,'.e','e')
	# button.e should stop the event but not execute ping
	# because we check self after stop
	await click($1,'.e b','')