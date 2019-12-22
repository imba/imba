test 'data attributes' do
	let el = <div data-test='one'>
	ok el.dataset.test == 'one'

test 'dynamic conditional class' do
	let a = "tata"
	let b = Math.random()
	let el = <div .test-{a}=b>

test 'cacheable function' do
	let a = "tata"
	let b = Math.random()
	def render
		var y = hello
		<self>
			<div test=(|a,b| a + b)>
			<div test=(|a,b| a + b + y)>
			<div test.x(y)=(|a,b| a + b)>
	self