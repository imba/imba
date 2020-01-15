class One

test do
	var str = 'string'
	ok str isa String

test do
	var num = 123
	ok num isa Number

test do
	var a = One.new
	ok a isa One

test do
	ok "a" !isa Array
	ok "a" isa String