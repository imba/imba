# Less common template syntax seen in real apps: comma separated bodies,
# multi-line tag options with comments, `.[...]` styles, forward referenced
# PascalCase tags, `local tag`, `extend tag htmlelement`, tags created inside
# handlers, logical expressions as content and dynamic tag names.

extend tag htmlelement
	def tpl-kind
		'html'

local tag tpl-local
	<self> "local {data}"

tag tpl-kind-a
	<self> "A:{data}"

tag tpl-kind-b
	<self> "B:{data}"

const Upcase = {
	def $get target, key
		target[key]

	def $set value, target, key, name
		target[key] = typeof value == 'string' ? value.toUpperCase! : value
}

tag tpl-app
	# a field descriptor on a tag field
	shout @(Upcase)
	kind = 'a'
	label = null
	alias = 'al'
	issued = no
	created = null
	price = 5
	steps = [{id: 1, tag: 'tpl-kind-a'}, {id: 2, tag: 'tpl-kind-b'}]

	%text fs:13px

	# template method returning a string ternary next to other children
	def stat count
		<span.stat>
			<b> count
			count == 1 ? " view" : " views"

	<self>
		<p$commas> "a", "b"
		<span$shout> shout
		<div$stats>
			<stat(1)>
			<stat(price)>
		<p$tagcommas> <b>, <i>
		<div$dotstyle.[c:rgb(255,0,0)]> "red"
		<div$multi
			# a comment between tag options
			.one
			.two=(kind == 'a')
			title='multi'
			@click=(kind = 'b')
		> <span.first> "first"
		<div$mixstyle%text [fw:600]> "text"
		<div$styleonly> <[d:flex g:2px]> "flex"
		<Later$later%mix data=kind>
		<tpl-local$local data=1>
		<button$make @click=(do created = <tpl-local data=kind>)> "make"
		<span$or> label or alias
		<span$and> issued && <b> "issued"
		<span$and2> issued and label && <b> "both"
		<span$tern> issued ? (label or alias) : "Your Name"
		<span$chain> label or (issued && alias || 'none')
		<span$concat> "/ " + price
		<div$dynname> <{"tpl-kind-{kind}"} data=kind>
		<div$interp> for step in steps
			<tpl-kind-{step.tag.slice(-1)} key=step.id data=step.id>
		<div$exprname> for step in steps
			<{step.tag} key=step.id data=step.id>

# declared after its first use in tpl-app
tag Later
	<self> "later {data}"

describe "template syntax" do
	let app = imba.mount <tpl-app>

	test "comma separated text body" do
		eq app.$commas.textContent, 'ab'

	test "comma separated tag body" do
		eq app.$tagcommas.children.length, 2
		eq app.$tagcommas.children[0].nodeName, 'B'
		eq app.$tagcommas.children[1].nodeName, 'I'

	test "dot-prefixed inline style" do
		eq window.getComputedStyle(app.$dotstyle).color, 'rgb(255, 0, 0)'

	test "multi-line tag options with a comment and inline content" do
		let el = app.$multi
		assert el.classList.contains('one')
		assert el.classList.contains('two')
		eq el.title, 'multi'
		eq el.children.length, 1
		eq el.children[0].textContent, 'first'
		el.click!
		await imba.commit!
		eq app.kind, 'b'
		assert !el.classList.contains('two')
		app.kind = 'a'
		app.render!

	test "mixin followed by a spaced inline style" do
		let el = app.$mixstyle
		assert el.classList.contains('%text')
		eq window.getComputedStyle(el).fontSize, '13px'
		eq window.getComputedStyle(el).fontWeight, '600'

	test "tag with only an inline style" do
		let el = app.$styleonly.children[0]
		eq el.nodeName, 'DIV'
		eq window.getComputedStyle(el).display, 'flex'
		eq el.textContent, 'flex'

	test "PascalCase tag referenced before its declaration" do
		let el = app.$later
		assert el isa Later
		assert el.classList.contains('%mix')
		eq el.textContent, 'later a'

	test "field descriptor on a tag field" do
		eq app.$shout.textContent, ''
		app.shout = 'quiet'
		eq app.shout, 'QUIET'
		app.render!
		eq app.$shout.textContent, 'QUIET'

	test "string ternary inside a template method" do
		let stats = app.$stats.querySelectorAll('.stat')
		eq stats.length, 2
		eq stats[0].textContent, '1 view'
		eq stats[1].textContent, '5 views'
		app.price = 1
		app.render!
		eq stats[1].textContent, '1 view'
		app.price = 5
		app.render!
		eq stats[1].textContent, '5 views'

	test "local tag" do
		eq app.$local.textContent, 'local 1'
		eq app.$local.nodeName, 'TPL-LOCAL'

	test "extend tag htmlelement adds methods to elements" do
		eq app.$commas.tpl-kind!, 'html'
		eq app.$local.tpl-kind!, 'html'

	test "tag literal created inside a handler" do
		app.$make.click!
		await imba.commit!
		assert app.created isa HTMLElement
		eq app.created.nodeName, 'TPL-LOCAL'
		let first = app.created
		app.kind = 'b'
		app.$make.click!
		await imba.commit!
		eq app.created.data, 'b'
		assert app.created != first
		app.kind = 'a'
		app.render!

describe "logical expressions as content" do
	let app = imba.mount <tpl-app>

	test "or picks the first truthy value" do
		eq app.$or.textContent, 'al'
		app.label = 'lbl'
		app.render!
		eq app.$or.textContent, 'lbl'

	test "&& with a tag on the right" do
		eq app.$and.children.length, 0
		app.issued = yes
		app.render!
		eq app.$and.children.length, 1
		eq app.$and.textContent, 'issued'

	test "chained && with a tag on the right" do
		app.issued = yes
		app.label = null
		app.render!
		eq app.$and2.children.length, 0
		app.label = 'lbl'
		app.render!
		eq app.$and2.textContent, 'both'
		app.issued = no
		app.render!
		eq app.$and2.children.length, 0
		app.issued = yes
		app.render!

	test "ternary with a logical branch" do
		eq app.$tern.textContent, 'lbl'
		app.label = null
		app.render!
		eq app.$tern.textContent, 'al'
		app.issued = no
		app.render!
		eq app.$tern.textContent, 'Your Name'

	test "chained logical expressions" do
		app.label = null
		app.issued = no
		app.render!
		eq app.$chain.textContent, 'none'
		app.issued = yes
		app.render!
		eq app.$chain.textContent, 'al'
		app.label = 'x'
		app.render!
		eq app.$chain.textContent, 'x'

	test "string concatenation" do
		eq app.$concat.textContent, '/ 5'
		app.price = 7
		app.render!
		eq app.$concat.textContent, '/ 7'

describe "dynamic tag names" do
	let app = imba.mount <tpl-app>

	test "interpolated string as tag name" do
		let el = app.$dynname.children[0]
		eq el.nodeName, 'TPL-KIND-A'
		eq el.textContent, 'A:a'
		app.kind = 'b'
		app.render!
		eq app.$dynname.children.length, 1
		eq app.$dynname.children[0].nodeName, 'TPL-KIND-B'
		eq app.$dynname.textContent, 'B:b'

	test "interpolated tag name in a keyed loop" do
		let els = Array.from(app.$interp.children)
		eq els.map(do $1.nodeName), ['TPL-KIND-A','TPL-KIND-B']
		eq app.$interp.textContent, 'A:1B:2'
		app.steps = app.steps.slice(0).reverse!
		app.render!
		let now = Array.from(app.$interp.children)
		eq now[0], els[1]
		eq now[1], els[0]

	test "expression tag name in a keyed loop" do
		let els = Array.from(app.$exprname.children)
		eq els.map(do $1.nodeName), ['TPL-KIND-B','TPL-KIND-A']
		app.steps[0].tag = 'tpl-kind-a'
		app.render!
		let now = Array.from(app.$exprname.children)
		eq now[0].nodeName, 'TPL-KIND-A'
		eq now[1], els[1]
		eq app.$exprname.textContent, 'A:2A:1'
