let a = 0
let b = 0

tag A1
	def render
		<self>
			if a
				if b
					<div>
			<span>

test do
	const tree = <A1>
	
	ok !!tree.querySelector('span:only-child')
	a = 1
	tree.render!
	ok !!tree.querySelector('span:only-child')
	b = 1
	tree.render!
	ok !!tree.querySelector('div:first-child')