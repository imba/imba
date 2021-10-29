test 'data attributes' do
	let el = <div data-test='one'>
	ok el.dataset.test == 'one'

test 'dynamic conditional class' do
	let a = "tata"
	let b = 1 + Math.random()
	let el = <div .test-{a}=b>
	ok el.classList.contains('test-tata')

test 'css variables' do
	let a = "tata"
	let el = <div --depth=10>
	eq el.style.getPropertyValue('--depth'), '10'

test 'attributes without value' do
	let el = <button disabled>
	ok el.hasAttribute('disabled')

test 'cacheable function' do
	let a = "tata"
	let b = Math.random()
	def render
		let y = hello
		<self>
			<div test=(|a,b| a + b)>
			<div test=(|a,b| a + b + y)>
			<div test.x(y)=(|a,b| a + b)>
			<div data-value=Math.random()>
	self

test 'dynamic tag name' do
	let typ = 'todo'
	let el = <{typ}-item title=typ> 
	ok el.nodeName == 'TODO-ITEM'