import 'imba/spec'
tag A
	<self[fw:500 ..is-guest:600 ..some-state:700]> "Hello"
	# <self[fw:500 @is-guest:600 some-state:700]>
	# <self[fw:500 @is-guest:600 some-state:700]>

let el = imba.mount(<A>)
let flags = document.documentElement.classList

test do
	eqcss el, 500
	# 
	flags.add('is-guest')
	eqcss el, 600
	flags.add('some-state')
	eqcss el, 700