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
