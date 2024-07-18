test 'imba.locals' do
	imba.locals.x = 1
	eq imba.locals.x,1
	delete imba.locals.x

test 'nested' do
	let ns = imba.locals('hello')
	ns.y = 1
	eq ns.y,1
	eq global.localStorage.getItem(':hello:y'),'1'
	delete ns.y
	eq global.localStorage.getItem(':hello:y'),null