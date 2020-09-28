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

