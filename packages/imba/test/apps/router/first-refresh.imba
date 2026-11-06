# This file checks the first router refresh after the page load.
# Do not add other router work to it.

let router = imba.router
let changes = []

router.on('change') do(e)
	changes.push(e)

test 'a popstate to the same url after the page load sends no change' do
	global.history.pushState(null,'',global.location.href)
	let popped = new Promise do(resolve)
		global.addEventListener('popstate',resolve,once: yes)
	global.history.back!
	await popped
	eq changes.length,0
