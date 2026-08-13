test 'attributes without value' do
	let el = <button disabled>
	ok el.hasAttribute('disabled')

tag A
	attr someattr
	attr preattr = 'hello'

test 'attr declaration' do
	let el = <A someattr=1>
	ok el.hasAttribute('someattr')

test 'attr default' do
	let el = <A>
	eq el.getAttribute('preattr'), 'hello'

test 'attr default override' do
	let el = <A preattr='world'>
	eq el.getAttribute('preattr'), 'world'

test 'dataset' do
	let el = <div data-one='a'>
	eq el.dataset.one, 'a'

test 'dataset 2' do
	let el = <div data-one-more='a'>
	eq el.dataset.oneMore, 'a'

test 'contenteditable' do
	let el = <div contenteditable="true">
	eq el.contentEditable, 'true'
	eq el.getAttribute('contenteditable'), 'true'

	let el2 = <div contentEditable="true">
	eq el2.contentEditable, 'true'

	let el3 = <div contenteditable="plaintext-only">
	eq el3.contentEditable, 'plaintext-only'

	let el4 = <div contenteditable=true>
	eq el4.contentEditable, 'true'

	let el5 = <div contenteditable=false>
	eq el5.contentEditable, 'false'

test 'spellcheck' do
	let el = <div spellcheck=false>
	eq el.spellcheck, false
	eq el.getAttribute('spellcheck'), 'false'

	let el2 = <div spellcheck="false">
	eq el2.spellcheck, false

	let el3 = <div spellCheck=false>
	eq el3.spellcheck, false

	let el4 = <div spellcheck=true>
	eq el4.spellcheck, true

	let el5 = <div spellcheck="true">
	eq el5.spellcheck, true

let optionalSetterCalls = []

extend tag element
	set optional-tip val,prev
		optionalSetterCalls.push(val)

test 'dynamic custom setters ignore initial undefined' do
	optionalSetterCalls = []
	let item = {}
	let el = <div optional-tip=item.tip>
	eq optionalSetterCalls.length, 0

	optionalSetterCalls = []
	let tipped = {tip: 'hello'}
	let el2 = <div optional-tip=tipped.tip>
	eq optionalSetterCalls.length, 1
	eq optionalSetterCalls[0], 'hello'
