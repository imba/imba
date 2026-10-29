# switch/when, ternaries and postfix conditionals as tag content,
# plus interpolated text content next to sibling elements.

tag sw-item
	<self> "item {data}"

describe "switch inside nested tags" do
	tag sw-app
		mode = 'a'
		<self>
			<div$box>
				<header> "head"
				switch mode
					when 'a', 'b'
						<b.ab> "ab {mode}"
					when 'c'
						"plain text"
					when 'd'
						<sw-item data=mode>
						<i.extra> "extra"
					else
						<em> "other"
				<footer> "foot"
			<div$noelse>
				switch mode
					when 'a'
						<b> "only a"
					when 'c'
						<i> "only c"

	let app = imba.mount <sw-app>

	def middle
		Array.from(app.$box.childNodes).slice(1,-1).filter(do $1.nodeType != 8)

	test "first when renders between siblings" do
		eq app.$box.firstElementChild.nodeName, 'HEADER'
		eq app.$box.lastElementChild.nodeName, 'FOOTER'
		eq app.$box.querySelector('.ab').textContent, 'ab a'

	test "when with multiple values" do
		let el = app.$box.querySelector('.ab')
		app.mode = 'b'
		app.render!
		eq app.$box.querySelector('.ab'), el
		eq el.textContent, 'ab b'

	test "when branch with only text" do
		app.mode = 'c'
		app.render!
		assert !app.$box.querySelector('.ab')
		eq app.$box.textContent, 'headplain textfoot'

	test "when branch with multiple children" do
		app.mode = 'd'
		app.render!
		eq app.$box.querySelector('sw-item').textContent, 'item d'
		eq app.$box.querySelector('.extra').textContent, 'extra'
		eq app.$box.textContent, 'headitem dextrafoot'

	test "else branch" do
		app.mode = 'zzz'
		app.render!
		eq app.$box.querySelector('em').textContent, 'other'
		eq app.$box.textContent, 'headotherfoot'
		eq app.$box.lastElementChild.nodeName, 'FOOTER'

	test "switch without an else renders nothing for other values" do
		app.mode = 'a'
		app.render!
		eq app.$noelse.textContent, 'only a'
		app.mode = 'c'
		app.render!
		eq app.$noelse.innerHTML.replace(/<!--.*?-->/g,''), '<i>only c</i>'
		app.mode = 'q'
		app.render!
		eq app.$noelse.children.length, 0
		eq app.$noelse.textContent, ''
		app.mode = 'a'
		app.render!
		eq app.$noelse.textContent, 'only a'

	test "switching back reuses the branch element" do
		app.mode = 'a'
		app.render!
		let el = app.$box.querySelector('.ab')
		app.mode = 'zzz'
		app.render!
		app.mode = 'a'
		app.render!
		eq app.$box.querySelector('.ab'), el
		eq app.$box.textContent, 'headab afoot'

describe "switch inside a loop" do
	def size item
		item < 3 ? 'small' : (item < 8 ? 'medium' : 'large')

	tag sw-loop
		items = [1, 5, 10]
		<self> for item in items
			<div.cell>
				switch size(item)
					when 'small'
						<s> "small"
					when 'medium'
						"medium {item}"
					else
						<b> "large"

	let app = imba.mount <sw-loop>

	test "each iteration picks its own branch" do
		let cells = app.querySelectorAll('.cell')
		eq cells.length, 3
		eq cells[0].innerHTML, '<s>small</s>'
		eq cells[1].textContent, 'medium 5'
		eq cells[2].innerHTML, '<b>large</b>'

	test "branches update when the data changes" do
		app.items = [10, 1]
		app.render!
		let cells = app.querySelectorAll('.cell')
		eq cells.length, 2
		eq cells[0].innerHTML, '<b>large</b>'
		eq cells[1].innerHTML, '<s>small</s>'

describe "ternaries as tag content" do
	tag sw-ternary
		count = 1
		busy = no
		aborted = no
		<self>
			<span$plural> count == 1 ? " view" : " views"
			<span$parens> (busy ? "Redoing…" : "Redo this")
			<span$interp> "{count} {count == 1 ? 'view' : 'views'}"
			<span$nested> busy ? 'Draft' : (count == 1 ? '1 reply' : "{count} replies")
			<b$chained> aborted ? "Aborted" : busy ? (count > 2 ? "Failed" : "Wrote") : "Write"
			# (kept before $mixed: a tag-with-content ternary followed by a
			# ternary on a tag with attributes fails to parse - reported)
			<p$tags> busy ? <sw-item data='busy'> : <em> "idle"
			<p$mixed>
				<b> "count:"
				count > 1 ? <i> "many" : <s> "one"

	let app = imba.mount <sw-ternary>

	test "string ternaries render the matching branch" do
		eq app.$plural.textContent, ' view'
		eq app.$parens.textContent, 'Redo this'
		eq app.$interp.textContent, '1 view'

	test "string ternaries update on render" do
		app.count = 3
		app.busy = yes
		app.render!
		eq app.$plural.textContent, ' views'
		eq app.$parens.textContent, 'Redoing…'
		eq app.$interp.textContent, '3 views'

	test "nested ternaries" do
		app.busy = no
		app.count = 1
		app.render!
		eq app.$nested.textContent, '1 reply'
		eq app.$chained.textContent, 'Write'
		app.count = 4
		app.render!
		eq app.$nested.textContent, '4 replies'
		app.busy = yes
		app.render!
		eq app.$nested.textContent, 'Draft'
		eq app.$chained.textContent, 'Failed'
		app.count = 1
		app.render!
		eq app.$chained.textContent, 'Wrote'
		app.aborted = yes
		app.render!
		eq app.$chained.textContent, 'Aborted'
		app.aborted = no
		app.count = 3
		app.render!

	test "tag ternary next to a sibling" do
		eq app.$mixed.innerHTML, '<b>count:</b><i>many</i>'
		app.count = 1
		app.render!
		eq app.$mixed.innerHTML, '<b>count:</b><s>one</s>'

	test "ternary between a component and an element" do
		eq app.$tags.firstElementChild.nodeName, 'SW-ITEM'
		eq app.$tags.textContent, 'item busy'
		app.busy = no
		app.render!
		eq app.$tags.innerHTML, '<em>idle</em>'
		app.busy = yes
		app.render!
		eq app.$tags.textContent, 'item busy'
		eq app.$tags.children.length, 1

describe "postfix conditionals and text content" do
	tag sw-text
		message = null
		name = 'Ann'
		<self>
			<div$postfix>
				<span.lead> "With regards from " if !message
				<b> name
				<i.banner> unless message
			<div$note>
				if message
					<span>
						<i> "note: "
						"{message}"
				else
					<span.none>
			<p$mixed>
				"Hello "
				"{name}"
				<b> "!"

	let app = imba.mount <sw-text>

	test "postfix if applies to the whole tag" do
		eq app.$postfix.children.length, 3
		assert app.$postfix.firstElementChild.classList.contains('lead')
		assert !!app.$postfix.querySelector('.banner')
		eq app.$postfix.textContent, 'With regards from Ann'
		app.message = 'hi'
		app.render!
		assert !app.$postfix.querySelector('.lead')
		assert !app.$postfix.querySelector('.banner')
		eq app.$postfix.textContent, 'Ann'

	test "interpolated text next to an element" do
		eq app.$note.textContent, 'note: hi'
		let span = app.$note.firstElementChild
		app.message = 'bye'
		app.render!
		eq app.$note.firstElementChild, span
		eq app.$note.textContent, 'note: bye'
		app.message = null
		app.render!
		eq app.$note.children.length, 1
		assert app.$note.firstElementChild.classList.contains('none')
		eq app.$note.textContent, ''

	test "static and interpolated text siblings" do
		eq app.$mixed.textContent, 'Hello Ann!'
		app.name = 'Bo'
		app.render!
		eq app.$mixed.textContent, 'Hello Bo!'
		eq app.$mixed.children.length, 1
