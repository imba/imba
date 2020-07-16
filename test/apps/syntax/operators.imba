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


test '??' do
	eq (zero ?? 1),0
	eq (nill ?? 1),1
	eq (udef ?? 1),1
	eq (undefined ?? null ?? 2),2
	eq (undefined ?? 1 ?? 2),1
	
	let obj = {nill: null, val: undefined}
	eq (obj.nill ?? obj.val ?? 10), 10

# Reassignment

test '=?' do
	let a = 2
	let o = {}
	
	eq (a =? 1),yes
	eq (a =? 1),no
	eq (a =? 2),yes
	eq (a =? 2),no
	
	eq (o.init =? 1),yes
	eq (o.init =? 1),no
	eq o.init,1

# Bitwise operators

const F = 
	INIT: 1
	DONE: 2
	BUSY: 4

test '!&' do
	let a = 2
	let b = 0
	eq a & 2,2
	eq b & 2,0
	eq a !& 2,false
	eq b !& 2,true

test '|=' do
	let a = 0
	a |= F.DONE
	eq a,2
	
test '|=?' do
	let a = 0
	eq (a |=? F.DONE), yes
	eq (a |=? F.DONE), no

test '~=' do
	let a = F.DONE
	eq a,2
	a ~= F.DONE
	eq a,0

test '~=?' do
	let a = 7
	# removed bit first time
	eq (a ~=? F.DONE), yes
	eq a & F.DONE,0
	eq (a ~=? F.DONE), no

test '^=' do
	let a = 7
	eq (a ^= 2),5
	eq a,5
	eq (a ^= 2),7

test '^=?' do
	let a = 7
	eq (a ^=? 2),false
	eq a,5
	eq (a ^=? 2),true