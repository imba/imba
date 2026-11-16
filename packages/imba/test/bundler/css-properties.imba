# Checks that the bundler removes repeated @property rules from merged css.
# Run via `npm run test-bundler` (also part of CI).
import assert from 'node:assert'
import {dedupePropertyRules} from '../../src/bundler/utils'

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

	process.exit(1) if failed

main!
