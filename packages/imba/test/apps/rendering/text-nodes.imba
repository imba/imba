tag app-root
	prop box = {}

	def render
		<self>
			<div> "W{box.width} H{box.height}"

imba.mount let app = <app-root>

test do
	eq app.textContent, "W H"
	app.box.width = 1
	app.render!
	eq app.textContent, "W1 H"
	app.box.width = 2
	app.box.height = 1
	app.render!
	eq app.textContent, "W2 H1"

# text children placed through branches are not value-cached by the compiler,
# so the reconciler itself must avoid rewriting identical text - rewriting
# resets caret/selection inside the node (breaks contenteditable)
tag cond-text
	prop on = yes
	prop msg = "hello"

	def render
		<self>
			if on
				msg
			else
				<b> "other"

test "rerender does not touch unchanged text nodes" do
	imba.mount let app = <cond-text>
	eq app.textContent, "hello"

	let observer = new MutationObserver(do yes)
	observer.observe(app, subtree: yes, characterData: yes, childList: yes)

	app.render!
	eq app.textContent, "hello"
	eq observer.takeRecords!.length, 0

	app.msg = "changed"
	app.render!
	eq app.textContent, "changed"
	assert observer.takeRecords!.length > 0

	app.on = no
	app.render!
	eq app.textContent, "other"

	app.on = yes
	app.render!
	eq app.textContent, "changed"
	eq observer.takeRecords!.filter(do $1.type === 'characterData').length, 0

	observer.disconnect!