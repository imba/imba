# Checks that the bundler removes repeated @property rules from merged css, and
# that it writes the rules the compiler shares between stylesheets once.
# Run via `npm run test-bundler` (also part of CI).
import assert from 'node:assert'
import {dedupePropertyRules,mergeSharedRules} from '../../src/bundler/utils'
import {StyleExtenders} from '../../src/compiler/styler.mjs'

let failed = 0

def check name, cb
	try
		await cb!
		console.log "ok - {name}"
	catch e
		failed++
		console.error "not ok - {name}"
		console.error "    {e.message}"

const X = '@property --t_x{syntax:"*";inherits:false;initial-value:0}'
const Y = '@property --t_y{syntax:"*";inherits:false;initial-value:0}'

# the rules a compiled stylesheet repeats
const INSTANT = '._instant_:not(#_):not(#_):not(#_):not(#_) \{ transition-duration:0ms !important; \}'
const ENTER = ':where(.\\@enter),:where(.\\@leave) \{--e_ad:300ms;\}'
const EASE = StyleExtenders.ease.body
const MOVE = StyleExtenders.transform.body
const MOVE3D = StyleExtenders.transform_complex.body

def block selector, body
	"{selector} \{\n{body}\n\}"

def count text, part
	text.split(part).length - 1

def main
	await check "a rule repeated in a later stylesheet is removed from the earlier one" do
		let out = dedupePropertyRules(["{X}\n{Y}\n.a\{--t_x:1px\}","{X}\n.b\{--t_x:2px\}"])
		assert.equal out[0], "\n{Y}\n.a\{--t_x:1px\}"
		assert.equal out[1], "{X}\n.b\{--t_x:2px\}"

	await check "collapse removes the line of the rule" do
		let out = dedupePropertyRules(["{X}\n{Y}\n.a\{--t_x:1px\}","{X}\n.b\{--t_x:2px\}"],yes)
		assert.equal out[0], "{Y}\n.a\{--t_x:1px\}"

	await check "a rule repeated inside one stylesheet keeps the last one" do
		let out = dedupePropertyRules(["{X}.a\{c:red\}{X}.b\{c:blue\}"])
		assert.equal out[0], ".a\{c:red\}{X}.b\{c:blue\}"

	await check "rules that only differ in whitespace are the same" do
		let spaced = '@property --t_x \{ syntax:"*";inherits:false;initial-value:0 \}'
		let out = dedupePropertyRules(["{spaced}\n.a\{c:red\}",X],yes)
		assert.equal out[0], ".a\{c:red\}"

	await check "a property that is registered differently later on stays in place" do
		let other = '@property --t_x{syntax:"<length>";inherits:false;initial-value:0px}'
		let sheets = [X,other,X]
		assert.deepEqual dedupePropertyRules(sheets), ['',other,X]

	await check "rules inside other rules, comments and strings are left alone" do
		let sheets = [
			"@media print\{{X}\}"
			"/* {X} */"
			".a\{content:'{X}'\}"
			X
		]
		assert.deepEqual dedupePropertyRules(sheets), sheets

	await check "the input is not changed" do
		let sheets = [X,X]
		dedupePropertyRules(sheets)
		assert.deepEqual sheets, [X,X]

	await check "a rule that is repeated further down is removed" do
		let out = mergeSharedRules(["{INSTANT}\n{ENTER}\n.a\{c:red\}","{INSTANT}\n{ENTER}\n.b\{c:blue\}"],yes)
		assert.deepEqual out, [".a\{c:red\}","{INSTANT}\n{ENTER}\n.b\{c:blue\}"]

	await check "rules that only differ in whitespace are repeated rules" do
		let out = mergeSharedRules([".a,.b\{c:red;d:blue !important\}.c\{e:f\}",".a , .b \{\n\tc: red;\n\td: blue!important;\n\}"])
		assert.equal out[0], ".c\{e:f\}"

	await check "rules with another selector, body or at-rule are not repeated rules" do
		let sheets = [
			".a\{c:red\}"
			".b\{c:red\}"
			".a\{c:blue\}"
			"@media print\{.a\{c:red\}\}"
			"@media screen\{.a\{c:red\}\}"
			'.a{content:"a  b"}'
			'.a{content:"a b"}'
			".a\{c:red\}"
		]
		let out = mergeSharedRules(sheets)
		assert.deepEqual out, [''].concat(sheets.slice(1))

	await check "an at-rule that is left without rules is removed" do
		let out = mergeSharedRules(["@media print\{.a\{c:red\}\}.b\{c:red\}@media print\{.a\{c:red\}.c\{c:red\}\}"])
		assert.equal out[0], ".b\{c:red\}@media print\{.a\{c:red\}.c\{c:red\}\}"
		out = mergeSharedRules(["@supports (x:y)\{@media print\{.a\{c:red\}\}\}.b\{d:e\}@supports (x:y)\{@media print\{.a\{c:red\}\}\}"])
		assert.equal out[0], ".b\{d:e\}@supports (x:y)\{@media print\{.a\{c:red\}\}\}"

	await check "rules in strings, comments and other at-rules are left alone" do
		let sheets = [
			'.a{content:"}.b{c:red}"}'
			"/* .b\{c:red\} */"
			"@keyframes x\{0%\{c:red\}0%\{c:red\}\}"
			"@layer x\{.b\{c:red\}\}"
			".b\{c:red\}"
		]
		assert.deepEqual mergeSharedRules(sheets), sheets

	await check "ease blocks are joined into the first one" do
		let one = "{block('.a, .b',EASE)}\n.a:not(#_) \{--e_ad:1s\}"
		let two = "{block('.c',EASE)}\n.c:not(#_) \{--e_ad:2s\}"
		let three = "{block('.d, .a',EASE)}\n.d:not(#_) \{--e_rest:color 1s\}"
		let out = mergeSharedRules([one,two,three],yes)
		assert.deepEqual out, [
			"{block('.a, .b, .c, .d',EASE)}\n.a:not(#_) \{--e_ad:1s\}"
			".c:not(#_) \{--e_ad:2s\}"
			".d:not(#_) \{--e_rest:color 1s\}"
		]

	await check "transform blocks are joined, each kind on its own" do
		let out = mergeSharedRules([
			"{block('.a',MOVE)}{block('.b',MOVE3D)}"
			"{block('.c',MOVE3D)}{block('.d',MOVE)}"
		],yes)
		assert.deepEqual out, ["{block('.a, .d',MOVE)}{block('.b, .c',MOVE3D)}",""]

	await check "minified blocks are joined" do
		let min = do(selector,body) "{selector}\{{body.replace(/\s+/g,' ').replace(/\s?([:;,])\s?/g,'$1').replace(/;$/,'')}\}"
		let out = mergeSharedRules(["{min('.a',EASE)}{min('.a',MOVE)}.a\{c:red\}{min('.b,.c',EASE)}{min('.b',MOVE)}"])
		assert.equal out[0], "{min('.a,.b,.c',EASE)}{min('.a,.b',MOVE)}.a\{c:red\}"

	await check "a block inside an at-rule is only joined with blocks under the same at-rule" do
		let out = mergeSharedRules([
			"{block('.a',MOVE)}\n@media print \{\n{block('.b',MOVE)}\n\}"
			"@media print \{\n{block('.c',MOVE)}\n\}\n@media screen \{\n{block('.d',MOVE)}\n\}\n{block('.e',MOVE)}"
		],yes)
		assert.deepEqual out, [
			"{block('.a, .e',MOVE)}\n@media print \{\n{block('.b, .c',MOVE)}\n\}"
			"@media screen \{\n{block('.d',MOVE)}\n\}\n"
		]

	await check "a block is not moved past a rule that can win over it" do
		for rule in ['.x{transform:none}','.x{-webkit-transform:none}','.x{all:unset}','@media print{.x{transform:none}}','@layer x{.x{c:red}}','.x{&.y{c:red}}']
			let sheets = ["{block('.a',MOVE)}{rule}",block('.b',MOVE)]
			assert.deepEqual mergeSharedRules(sheets), sheets, rule
		for rule in ['.x{transition:none}','.x{transition-delay:1s}','.x{--e_b:1s}']
			let sheets = ["{block('.a',EASE)}{rule}",block('.b',EASE)]
			assert.deepEqual mergeSharedRules(sheets), sheets, rule
		# the next block is joined into the one that stayed
		let out = mergeSharedRules(["{block('.a',MOVE)}.x\{transform:none\}",block('.b',MOVE),block('.c',MOVE)],yes)
		assert.deepEqual out, ["{block('.a',MOVE)}.x\{transform:none\}",block('.b, .c',MOVE),""]

	await check "a block is moved past rules that cannot win over it" do
		let rules = [
			'.x:not(#_){transform:none}'
			'#x{transform:none}'
			'.x{transform:none !important}'
			'.x{transform-origin:0 0;--t_x:1px;translate:1px}'
			'@keyframes x{0%{transform:none}}'
			block('.x::-moz-range-thumb',MOVE)
		]
		for rule in rules
			let out = mergeSharedRules(["{block('.a',MOVE)}{rule}",block('.b',MOVE)])
			assert.deepEqual out, ["{block('.a, .b',MOVE)}{rule}",block('.b',MOVE).replace(/[^\n]+/g,'')], rule
		# a selector with an id is held back by a rule that counts an id
		let sheets = ["{block('.a',MOVE)}.x:is(.y,#z)\{transform:none\}",block('#b',MOVE)]
		assert.deepEqual mergeSharedRules(sheets), sheets
		sheets = ["{block('.a',MOVE)}.x:where(#z),[href='#z']\{transform:none\}",block('#b',MOVE)]
		assert.equal mergeSharedRules(sheets,yes)[1], ''
		let out = mergeSharedRules(["{block('.a',EASE)}._instant_:not(#_)\{transition-duration:0ms !important\}.x\{transition-behavior:allow-discrete !important\}",block('.b',EASE)],yes)
		assert.equal count(out.join(''),'--e_b:'), 1

	await check "a block with a selector that not every browser reads stays where it is" do
		for selector in ['.b::-moz-range-thumb','.b:has(.c)','.b:nth-child(2 of .c)','.b::part(x)','.b:has(']
			let sheets = [block('.a',MOVE),block(".c, {selector}",MOVE),block('.d',MOVE)]
			let out = mergeSharedRules(sheets,yes)
			assert.deepEqual out, [block('.a, .d',MOVE),sheets[1],''], selector
		let out = mergeSharedRules([block('.a',MOVE),block('.b:not(.c) > i:nth-child(2)::before, .b:after, [data-x="a:b"] svg :is(path,g):where(.d)',MOVE)],yes)
		assert.equal count(out.join(''),'transform:'), 1

	await check "the lines stay in place unless they are collapsed" do
		let sheet = "{INSTANT}\n{block('.a',EASE)}\n.x \{\n  c: red;\n\}\n{INSTANT}\n{block('.b,\n.c',EASE)}\n@media print \{\n  {block('.b',MOVE)}\n\}\n@media print \{\n  {block('.b',MOVE)}\n\}\n.y \{\n  c: blue;\n\}"
		let lines = sheet.split('\n')
		let kept = mergeSharedRules([sheet])[0].split('\n')
		assert.equal kept.length, lines.length
		assert.equal kept[1], '.a, .b, .c {'
		for line,i in kept
			assert.ok line == '' or line == lines[i] or i == 1, "line {i + 1}: {line}"
		assert.equal kept.indexOf('.x {'), lines.indexOf('.x {')
		assert.equal kept.indexOf('.y {'), lines.indexOf('.y {')
		let collapsed = mergeSharedRules([sheet],yes)[0]
		assert.equal collapsed, "{block('.a, .b, .c',EASE)}\n.x \{\n  c: red;\n\}\n{INSTANT}\n@media print \{\n  {block('.b',MOVE)}\n\}\n.y \{\n  c: blue;\n\}"

	await check "the stylesheets are not changed" do
		let sheets = [block('.a',MOVE),block('.b',MOVE)]
		mergeSharedRules(sheets)
		assert.deepEqual sheets, [block('.a',MOVE),block('.b',MOVE)]

	process.exit(1) if failed

main!
