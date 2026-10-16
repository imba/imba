# Checks the html that the server DOM (src/imba/dom/core.imba) writes.
# Run via `npm run test-server` (also part of CI).
import assert from 'node:assert'

const MARKUP = '</title><script>alert(1)</script>'
const ESCAPED = '&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;'

let failed = 0

def check name, cb
	try
		cb!
		console.log "ok - {name}"
	catch e
		failed++
		console.error "not ok - {name}"
		console.error "    {e.message}"

tag text-escape-card
	prop heading = ''

	def render
		<self>
			<h2> heading

check "dynamic text is escaped" do
	assert.equal String(<title> MARKUP), "<title>{ESCAPED}</title>"

check "interpolated text is escaped" do
	assert.equal String(<p> "Lesson: {MARKUP}"), "<p>Lesson: {ESCAPED}</p>"

check "text rendered by a component is escaped" do
	let html = String(<text-escape-card heading=MARKUP>)
	assert.ok html.indexOf('<script>') == -1, html
	assert.ok html.indexOf(ESCAPED) >= 0, html

check "dynamic text in script and style stays raw" do
	let json = '{"name":"a > b"}'
	assert.equal String(<script type="application/ld+json"> json), "<script type=\"application/ld+json\">{json}</script>"
	let rule = '.row > div \{ color: red; \}'
	assert.equal String(<style> rule), "<style>{rule}</style>"

process.exit(1) if failed
