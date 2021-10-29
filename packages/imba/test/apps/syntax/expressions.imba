def other
	const aba = 100

test do
	eq other!, 100

def letlet
	let x = let y = 200

test do
	eq letlet!, 200

def ifconst bool
	if bool
		const x = 100

test do
	eq ifconst(yes), 100
	eq ifconst(no), undefined

def main
	const subs = [1,2]
	for sub in subs
		if sub % 2 == 0
			const x = 100
		else
			200

test do
	eq main!,[200,100]

def lettry
	let x = try
		"hello"

test do
	eq lettry!,"hello"

def constif bool
	const x = if bool
		for b in [1,2,3]
			b * 20
		1
	else
		0

test do
	eq constif(false),0
	eq constif(true),1

def consttry bool
	const x = try
		bool && Math.methodNotFound!
		1
	catch e
		2

test do
	eq consttry(false),1
	eq consttry(true),2