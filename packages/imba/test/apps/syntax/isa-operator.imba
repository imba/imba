class One

test do
	let str = 'string'
	ok str isa String

test do
	let num = 123
	ok num isa Number

test do
	let a = new One
	ok a isa One

test do
	ok "a" !isa Array
	ok "a" isa String