import * as imbac from 'imba/compiler'

let fs = {}

fs.code1 = """
global css div color:mint1 stroke:mint2 bgc:mint3
"""

fs.unitModifiers = """
global css .odoc
	1codefs:11px @800:13px
	1gap:10px @@500:20px
	1titlebarh:50px ..minimized:32px
"""

fs.colorAliases = """
global css @root
	#cardbg:lch(20 0 0)
	#tilebg:#cardbg
	#tilebd:#cardbg(1.2l c h)

tag App
	<self.wrapper>
		css
			#tile-surface:#tilebg
			#tile-border:#tilebd
			bg:#tile-surface
			bd:1px solid #tile-border
"""

fs.astHelpers = """
global css .x
	2gap:10px
	color:black/50%
"""

def compile name, o = {}
	o.sourcePath ||= "{name}.imba"
	imbac.compile(fs[name],o)

def walk node, fn, seen = new Set
	return unless node and typeof node == 'object'
	return if seen.has(node)
	seen.add(node)
	fn(node)
	for key in Object.keys(node)
		let value = node[key]
		if Array.isArray(value)
			for item in value
				walk(item,fn,seen)
		else
			walk(value,fn,seen)

def findNode root, fn
	let found = null
	walk(root) do |node|
		found ||= node if !found and fn(node)
	found

test 'custom color' do
	let res = compile('code1', config: {theme: {
		colors: {
			mint: {
				"1": "hsl(140, 27%, 96%)",
				"3": "hsl(138, 24%, 89%)"
			}
		}
	}})

	ok res.css.match(/color:\s*hsla\(140/)
	ok res.css.match(/stroke:\s*hsla\(139/)
	ok res.css.match(/background-color:\s*hsla\(138/)

test 'unit variable modifier declarations inherit normalized property names' do
	let res = compile('unitModifiers', styles: 'extern')

	ok res.css.match(/--u_codefs:\s*13px/)
	ok res.css.match(/--u_gap:\s*20px/)
	ok res.css.match(/--u_titlebarh:\s*32px/)
	ok !res.css.match(/\b1(?:codefs|gap|titlebarh)\s*:/)

test 'color variable aliases preserve lch channel references' do
	let res = compile('colorAliases', styles: 'extern', platform: 'browser', resolveColors: true)

	ok res.css.match(/--u_tilebgL:\s*var\(--u_cardbgL\)/)
	ok res.css.match(/--u_tilebdL:\s*calc\(var\(--u_cardbgL\) \* 1\.2\)/)
	ok res.css.match(/--u_tile-surfaceL:\s*var\(--u_tilebgL\)/)
	ok res.css.match(/--u_tile-borderL:\s*var\(--u_tilebdL\)/)
	ok !res.css.match(/--u_tilebgL:\s*0\b/)
	ok !res.css.match(/--u_tile-borderL:\s*81\.3\b/)

test 'style ast keeps imba1 helper accessors' do
	let root = imbac.parse(fs.astHelpers, sourcePath: 'ast-helpers.imba')
	let unitDecl = findNode(root) do |node|
		node._property and node._property._name == '2gap'
	let unitProp = unitDecl._property
	let expr = unitDecl._expr._nodes[0]
	let identifier = findNode(root) do |node|
		node._value and String(node._value) == 'black'
	let dimension = findNode(root) do |node|
		node._unit == 'px' and node._number == 10

	ok typeof unitProp.isUnit == 'function'
	ok typeof unitProp.number == 'function'
	ok typeof unitProp.unit == 'function'
	ok typeof unitProp.kind == 'function'
	ok typeof expr.toIterable == 'function'
	ok typeof identifier.kind == 'function'
	ok typeof identifier.color == 'function'
	ok typeof identifier.setColor == 'function'
	ok typeof dimension.number == 'function'
	ok typeof dimension.setNumber == 'function'
	ok typeof dimension.setUnit == 'function'

	eq unitProp.isUnit(), 'gap'
	eq unitProp.number(), 2
	eq unitProp.unit(), 'gap'
	eq expr.toIterable(), expr._nodes
	eq identifier.setColor('white'), identifier
	eq identifier.color(), 'white'
	eq dimension.number(), 10
	eq dimension.unit, 'px'
	eq dimension.setNumber(12), dimension
	eq dimension.number(), 12
	eq dimension.setUnit('rem'), dimension
	eq dimension.unit, 'rem'
