###
Imba supports typescript typings not to be a strict statically typed language
but rather to provide good tooling (ie goto definition, completions etc).
Due to the dynamic nature of Imba there are many common patterns typescript
reports as errors that we simply silence. 
###

const Rules = [
	
	code: 2322	
	text: /^\$\d+/
	---
	code: 2612
	message: /./
	---
	code: 2322 # should only be for dom nodes?
	message: /^Type '(boolean|string|number|ImbaAsset|typeof import\("data:text\/asset;\*"\))' is not assignable to type '(string|number|boolean)'/
	---
	code: 2308
	message: /exported a member named 'Ω/
	---
	code: 2339
	message: /on type 'EventTarget'/
	---
	code: 2339
	message: /\$CARET\$/
	---
	code: 2339
	message: /Property '_\$SYM\$/
	---
	code: 2350
	message: /Only a void function can be called/
	---
	code: 2551
	test: do({message},item)
		return no unless typeof message == 'string'
		if message.match(/^Property 'Ψ/)
			item.category = 0
		return no
	---
	code: 2339
	test: do({message},item)
		return no unless typeof message == 'string'
		if message.match(/^Property 'Ψ/)
			item.category = 0
			return yes # configurable in plugin?
		return no
	---
	code: 2339 # option allow array properties
	message: /on type '(.*)\[\]'/
	---
	code: 2339 # option allow array properties
	message: /on type 'Window'/
	---
	code: 2339 # option allow array properties
	message: /on type 'Window & typeof globalThis'/
	---
	code: 2556
	text: /\.\.\.arguments/
	---
	code: 2540 # should be toggled with option
	message: /^Cannot assign to /
	---
	code: 2557
	text: /\.\.\.arguments/
	---
	code: 2554
	test: do({message})
		return no unless typeof message == 'string'
		let m = message.match(/Expected (\d+) arguments, but got (\d+)/)
		return yes if m and parseInt(m[2]) > parseInt(m[1])
		return no
	---
	code: 2339 # should we always?
	message: /on type '\{\}'/
	---
	code: 2304 # dynamic asset items
	message: /Svg[A-Z]/
	---
	code: 2538 # dynamic asset items
	message: /unique symbol' cannot be used as an index type/
	---
	code: 2307
	message: /\.(txt|css|a?png|jpe?g|gif|svg)'/
	---
	code: 6232
	message: /./
	# Declaration augments declaration in other file - not possible to solve?
]


export def filter item
	let msg = item.messageText
	msg = msg.messageText or msg or ''
	item.#suppress = yes
		
	for rule in Rules
		if rule.code == item.code
			if rule.text isa RegExp
				return if rule.text.test(item.#otext)
			if rule.message isa RegExp
				return if rule.message.test(msg)
			if rule.test isa Function
				return if rule.test({message: msg, text: item.#otext},item)
	
	item.#suppress = no
	return item