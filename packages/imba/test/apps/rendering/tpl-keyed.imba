# Keyed tags (`key=expr`) in loops, outside loops, in template methods,
# on dynamic `<(expr)>` tags and inside slots of other components.

let mounts = 0
let remounts = 0
let unmounts = 0

tag k-row
	def mount
		mounts++
	def remount
		remounts++
	def unmount
		unmounts++
	<self> data.name

tag k-panel
	<self>
		<header> "panel"
		<section> <slot>

def mk ...names
	names.map do(name) {id: name, name: name}

def texts nodes
	Array.from(nodes).map(do $1.textContent).join(',')

def reverse list
	list.slice(0).reverse!

describe "key= in a for loop" do
	tag k-list
		items = mk('a','b','c')
		<self>
			<ul$plain> for item in items
				<li key=item> item.name
			<ul$ids> for item in items
				<li key=item.id .odd=(item.name == 'b')> item.name

	let app = imba.mount <k-list>

	test "renders one element per item" do
		eq texts(app.$plain.children), 'a,b,c'
		eq texts(app.$ids.children), 'a,b,c'

	test "object keys move elements on reorder" do
		let [a,b,c] = Array.from(app.$plain.children)
		app.items = reverse(app.items)
		app.render!
		let now = Array.from(app.$plain.children)
		eq texts(now), 'c,b,a'
		eq now[0], c
		eq now[1], b
		eq now[2], a

	test "id keys move elements on reorder" do
		let [c,b,a] = Array.from(app.$ids.children)
		app.items = [app.items[1], app.items[2], app.items[0]]
		app.render!
		let now = Array.from(app.$ids.children)
		eq texts(now), 'b,a,c'
		eq now[0], b
		eq now[1], a
		eq now[2], c
		assert now[0].classList.contains('odd')

	test "removed keys drop their element, kept keys keep theirs" do
		let byName = {}
		for el in app.$ids.children
			byName[el.textContent] = el
		app.items = app.items.filter(do $1.name != 'a')
		app.render!
		let now = Array.from(app.$ids.children)
		eq texts(now), 'b,c'
		eq now[0], byName.b
		eq now[1], byName.c

	test "new keys get new elements" do
		let first = app.$ids.children[0]
		app.items = [...app.items, ...mk('d')]
		app.render!
		eq texts(app.$ids.children), 'b,c,d'
		eq app.$ids.children[0], first

describe "keyed components in a loop" do
	tag k-comp-list
		items = mk('a','b','c')
		<self> for item in items
			<k-row data=item key=item.id>

	let app = imba.mount <k-comp-list>

	test "reordering moves component instances instead of recreating them" do
		let before = Array.from(app.children)
		let m = mounts
		let r = remounts
		let u = unmounts
		app.items = reverse(app.items)
		app.render!
		await imba.commit!
		let after = Array.from(app.children)
		eq texts(after), 'c,b,a'
		eq after[0], before[2]
		eq after[1], before[1]
		eq after[2], before[0]
		# moved nodes are remounted, never unmounted or mounted from scratch
		eq unmounts, u
		eq mounts, m
		assert remounts > r

	test "removing a keyed component unmounts only that one" do
		let u = unmounts
		app.items = app.items.filter(do $1.name != 'b')
		app.render!
		await imba.commit!
		eq texts(app.children), 'c,a'
		eq unmounts, u + 1

describe "key= outside of loops" do
	tag k-single
		page = {id: 1, name: 'one'}
		<self>
			<k-row data=page key=page>
			if page
				<div.page key=page> page.name

	let app = imba.mount <k-single>
	let one = app.page
	let two = {id: 2, name: 'two'}

	test "same key keeps the element across renders" do
		let row = app.querySelector('k-row')
		let div = app.querySelector('.page')
		app.render!
		eq app.querySelector('k-row'), row
		eq app.querySelector('.page'), div

	test "changing the key replaces the element" do
		let row = app.querySelector('k-row')
		let div = app.querySelector('.page')
		app.page = two
		app.render!
		assert app.querySelector('k-row') != row
		assert app.querySelector('.page') != div
		eq app.querySelector('k-row').textContent, 'two'
		eq app.querySelector('.page').textContent, 'two'
		eq app.querySelectorAll('k-row').length, 1
		eq app.querySelectorAll('.page').length, 1

	test "returning to an earlier key reuses its element" do
		app.page = one
		app.render!
		let row = app.querySelector('k-row')
		let div = app.querySelector('.page')
		app.page = two
		app.render!
		app.page = one
		app.render!
		eq app.querySelector('k-row'), row
		eq app.querySelector('.page'), div
		eq row.textContent, 'one'

describe "keyed plain elements outside of loops" do
	tag k-plain-slot
		<self> <slot>

	tag k-plain
		page = {id: 1, name: 'one'}
		<self>
			<header> "head"
			<div.static key=1> "static"
			<section.wrap>
				<i> "before"
				<div.dynamic key=page> page.name
				<i> "after"
			<k-plain-slot> <b.slotted key=page> page.name
			<footer> "foot"

	let app = imba.mount <k-plain>
	let one = app.page
	let two = {id: 2, name: 'two'}

	def names el
		Array.from(el.children).map(do $1.nodeName.toLowerCase!).join(',')

	test "are inserted in document order" do
		eq names(app), 'header,div,section,k-plain-slot,footer'
		eq app.querySelector('.static').textContent, 'static'
		eq texts(app.querySelector('.wrap').children), 'before,one,after'
		eq app.querySelector('.slotted').textContent, 'one'

	test "keep their element when the key is unchanged" do
		let st = app.querySelector('.static')
		let dyn = app.querySelector('.dynamic')
		let sl = app.querySelector('.slotted')
		app.render!
		eq app.querySelector('.static'), st
		eq app.querySelector('.dynamic'), dyn
		eq app.querySelector('.slotted'), sl

	test "are replaced in place when the key changes" do
		let dyn = app.querySelector('.dynamic')
		let sl = app.querySelector('.slotted')
		app.page = two
		app.render!
		assert app.querySelector('.dynamic') != dyn
		assert app.querySelector('.slotted') != sl
		eq texts(app.querySelector('.wrap').children), 'before,two,after'
		eq app.querySelectorAll('.dynamic').length, 1
		eq app.querySelectorAll('.slotted').length, 1
		eq app.querySelector('.slotted').textContent, 'two'
		eq names(app), 'header,div,section,k-plain-slot,footer'

	test "get their old element back for an earlier key" do
		app.page = one
		app.render!
		let dyn = app.querySelector('.dynamic')
		app.page = two
		app.render!
		app.page = one
		app.render!
		eq app.querySelector('.dynamic'), dyn
		eq texts(app.querySelector('.wrap').children), 'before,one,after'

describe "keyed tags returned from template methods" do
	tag k-methods
		items = mk('a','b','c')
		current = items[0]

		def entry item, index
			if item.name == 'b'
				<k-row.special data=item key=item>
			else
				<div.entry data-index=index key=item> item.name

		# a keyed dynamic tag as the root of a template method
		def wrapped item
			<entry(item,3).wrapped key=(item.name == 'b' ? 'row' : 'div')>

		<self>
			<div$single> <entry(current,9)>
			<div$rootkey> <wrapped(current)>
			<div$callkey> <entry(current,7).outer key=(current.name == 'b' ? 'row' : 'div')>
			<div$keyed> for item,i in items
				<entry(item,i) key=item>

	let app = imba.mount <k-methods>

	test "template method branches render" do
		eq texts(app.$keyed.children), 'a,b,c'
		eq app.$keyed.children[1].nodeName, 'K-ROW'
		assert app.$keyed.children[1].classList.contains('special')
		eq app.$keyed.children[2].dataset.index, '2'
		eq app.$single.textContent, 'a'
		eq app.$single.children[0].dataset.index, '9'

	test "a key inside the method caches one element per key" do
		let a = app.$single.children[0]
		app.current = app.items[2]
		app.render!
		let c = app.$single.children[0]
		assert c != a
		eq c.textContent, 'c'
		eq app.$single.children.length, 1
		app.current = app.items[1]
		app.render!
		eq app.$single.children[0].nodeName, 'K-ROW'
		app.current = app.items[0]
		app.render!
		eq app.$single.children[0], a
		app.current = app.items[2]
		app.render!
		eq app.$single.children[0], c
		eq app.$single.children.length, 1

	test "key on a template call outside a loop" do
		app.current = app.items[0]
		app.render!
		let el = app.$callkey.children[0]
		assert el.classList.contains('outer')
		assert el.classList.contains('entry')
		eq el.dataset.index, '7'
		app.current = app.items[1]
		app.render!
		let row = app.$callkey.children[0]
		eq row.nodeName, 'K-ROW'
		assert row.classList.contains('outer')
		app.current = app.items[2]
		app.render!
		eq app.$callkey.children.length, 1
		eq app.$callkey.textContent, 'c'
		assert app.$callkey.children[0].classList.contains('outer')
		app.current = app.items[0]
		app.render!
		eq app.$callkey.children[0], el

	test "keyed dynamic root of a template method" do
		app.current = app.items[0]
		app.render!
		let el = app.$rootkey.children[0]
		assert el.classList.contains('wrapped')
		eq el.textContent, 'a'
		app.current = app.items[1]
		app.render!
		eq app.$rootkey.children[0].nodeName, 'K-ROW'
		assert app.$rootkey.children[0].classList.contains('wrapped')
		app.current = app.items[0]
		app.render!
		eq app.$rootkey.children.length, 1
		eq app.$rootkey.children[0], el

	test "key on the call site keeps identity on reorder" do
		let [a,b,c] = Array.from(app.$keyed.children)
		app.items = reverse(app.items)
		app.render!
		let now = Array.from(app.$keyed.children)
		eq texts(now), 'c,b,a'
		eq now[0], c
		eq now[1], b
		eq now[2], a
		eq now[0].dataset.index, '0'
		eq now[2].dataset.index, '2'

describe "keyed tags from a top-level function" do
	def card item
		<section.card key=item> <b> item.name

	tag k-fn
		items = mk('a','b')
		<self> for item in items
			<card(item) key=item>

	let app = imba.mount <k-fn>

	test "renders keyed elements from a plain function" do
		eq app.children.length, 2
		eq app.children[0].nodeName, 'SECTION'
		assert app.children[0].classList.contains('card')
		eq texts(app.children), 'a,b'

	test "identity survives reorder" do
		let [a,b] = Array.from(app.children)
		app.items = reverse(app.items)
		app.render!
		eq app.children[0], b
		eq app.children[1], a
		eq texts(app.children), 'b,a'

	test "updating the item updates the cached element" do
		let el = app.children[0]
		app.items[0].name = 'B'
		app.render!
		eq app.children[0], el
		eq el.textContent, 'B'

describe "key= on dynamic <(expr)> tags" do
	tag k-dyn
		items = mk('a','b','c')
		template = do(item) <p.tpl> item.name

		def list items, tpl
			<div.list> for item in items
				<(tpl.call(self,item,items)) key=item>

		<self>
			<div$inline> for item in items
				<(template(item)) key=item>
			<div$listed>
				<list(items,template)>

	let app = imba.mount <k-dyn>

	test "renders dynamic keyed children" do
		eq texts(app.$inline.children), 'a,b,c'
		eq app.$inline.children[0].nodeName, 'P'
		eq texts(app.$listed.querySelectorAll('p')), 'a,b,c'

	test "dynamic keyed children keep identity on reorder" do
		let before = Array.from(app.$inline.children)
		let listed = Array.from(app.$listed.querySelectorAll('p'))
		app.items = reverse(app.items)
		app.render!
		let after = Array.from(app.$inline.children)
		eq texts(after), 'c,b,a'
		eq after[0], before[2]
		eq after[2], before[0]
		let listedAfter = Array.from(app.$listed.querySelectorAll('p'))
		eq texts(listedAfter), 'c,b,a'
		eq listedAfter[0], listed[2]
		eq listedAfter[2], listed[0]

describe "keyed tags inside slots" do
	tag k-slotted
		current = {id: 1, name: 'one'}
		items = mk('x','y')
		<self>
			<k-panel$single>
				<k-row data=current key=current>
			<k-panel$many> for item in items
				<k-row data=item key=item>

	let app = imba.mount <k-slotted>

	test "keyed child in a slot renders" do
		let row = app.$single.querySelector('section k-row')
		eq row.textContent, 'one'

	test "keyed child in a slot is replaced when the key changes" do
		let row = app.$single.querySelector('k-row')
		app.render!
		eq app.$single.querySelector('k-row'), row
		app.current = {id: 2, name: 'two'}
		app.render!
		let next = app.$single.querySelector('k-row')
		assert next != row
		eq next.textContent, 'two'
		eq app.$single.querySelectorAll('k-row').length, 1

	test "keyed loop in a slot keeps identity on reorder" do
		let [x,y] = Array.from(app.$many.querySelectorAll('k-row'))
		app.items = reverse(app.items)
		app.render!
		let now = Array.from(app.$many.querySelectorAll('k-row'))
		eq texts(now), 'y,x'
		eq now[0], y
		eq now[1], x

describe "keyed dynamic templates with inline styles in a loop" do
	tag k-layers
		layers = mk('a','b','c')
		dark = 'b'

		def layer item, kind
			<section.layer .{kind}> item.name

		<self> for item,i,l in layers
			let depth = l - i - 1
			<layer(item,'sheet') stacked level=i .dark=(item.name == dark) [$level:{i} $depth:{depth}] key=item>

	let app = imba.mount <k-layers>

	def prop el, name
		window.getComputedStyle(el).getPropertyValue(name).trim!

	test "renders flags, attributes and style variables" do
		let els = Array.from(app.children)
		eq texts(els), 'a,b,c'
		assert els[0].classList.contains('layer')
		assert els[0].classList.contains('sheet')
		assert els[1].classList.contains('dark')
		assert !els[0].classList.contains('dark')
		eq els[2].level, 2
		# a value-less attribute is set to its own name
		eq els[0].stacked, 'stacked'
		eq prop(els[0], '--level'), '0'
		eq prop(els[0], '--depth'), '2'
		eq prop(els[2], '--depth'), '0'

	test "reorder keeps identity and updates the variables" do
		let [a,b,c] = Array.from(app.children)
		app.layers = [app.layers[2], app.layers[0], app.layers[1]]
		app.dark = 'c'
		app.render!
		let els = Array.from(app.children)
		eq els[0], c
		eq els[1], a
		eq els[2], b
		eq prop(c, '--level'), '0'
		eq prop(c, '--depth'), '2'
		eq prop(b, '--level'), '2'
		eq b.level, 2
		assert c.classList.contains('dark')
		assert !b.classList.contains('dark')

	test "removing an item updates depth on the others" do
		app.layers = app.layers.slice(1)
		app.render!
		let els = Array.from(app.children)
		eq texts(els), 'a,b'
		eq prop(els[0], '--depth'), '1'
		eq prop(els[1], '--depth'), '0'
