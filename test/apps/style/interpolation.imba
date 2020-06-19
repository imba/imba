let count = 1

tag app-root
	<self>
		<h1> "Hellot here!"
		<div[zoom:{count} @md:{count + 1}]> "zoomed?"
		<button @click=(count++)> 'zoom in'

imba.mount(<app-root>)

test do
	ok 1
	# eqcss('app-root b', marginLeft: '1px', marginRight: '2px')
	# eqcss('app-item i', marginLeft: '2px', marginRight: '1px')