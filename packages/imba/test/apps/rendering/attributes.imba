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
