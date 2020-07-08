const nill = null
const udef = undefined
const zero = 0

test '||=' do
	let a = null
	a ||= 1
	eq a, 1
	
	let b = 0
	b ||= 1
	eq b, 1
	
	let c = undefined
	c ||= 1
	eq c, 1
	
	let d = ''
	d ||= 1
	eq d, 1

test '?=' do
	let a = 0
	let b = null

	a ?= 1
	b ?= 1
	
	eq a,0
	eq b,1

test '?:' do
	eq (zero ?: 1),0
	eq (nill ?: 1),1
	eq (udef ?: 1),1
	eq (undefined ?: null ?: 2),2
	eq (undefined ?: 1 ?: 2),1
	
	