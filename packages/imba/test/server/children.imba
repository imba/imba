# Checks how the server DOM (src/imba/dom/core.imba) places children.
# Run via `npm run test-server` (also part of CI).
import assert from 'node:assert'

let failed = 0

def check name, cb
	try
		cb!
		console.log "ok - {name}"
	catch e
		failed++
		console.error "not ok - {name}"
		console.error "    {e.message}"

tag loop-branches
	prop items = []

	def render
		<self> for item in items
			if item == 'a'
				<li> "A"
			elif item == 'b'
				<li> "B"

check "an element in a branch of a loop renders once" do
	assert.equal String(<loop-branches items=['a','b','c']>), '<loop-branches class="_ssr_"><li>A</li><li>B</li></loop-branches>'

check "appending a child that has a parent moves it" do
	let a = <div>
	let b = <div>
	let child = <span> "x"
	a.appendChild(child)
	b.appendChild(child)
	assert.equal String(a), '<div></div>'
	assert.equal String(b), '<div><span>x</span></div>'
	assert.equal child.parentNode, b

check "insertBefore places the node before the reference and sets its parent" do
	let list = <ul>
	let first = <li> "1"
	let last = <li> "3"
	list.appendChild(first)
	list.appendChild(last)
	let middle = <li> "2"
	list.insertBefore(middle, last)
	assert.equal String(list), '<ul><li>1</li><li>2</li><li>3</li></ul>'
	assert.equal middle.parentNode, list
	list.insertBefore(first, null)
	assert.equal String(list), '<ul><li>2</li><li>3</li><li>1</li></ul>'

check "removeChild clears the parent" do
	let list = <ul>
	let item = <li> "1"
	list.appendChild(item)
	list.removeChild(item)
	assert.equal String(list), '<ul></ul>'
	assert.equal item.parentNode, null

process.exit(1) if failed
