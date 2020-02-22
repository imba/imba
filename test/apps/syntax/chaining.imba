var data =
	user:
		name: 'hello'
		
test do
	eq data..user..name, 'hello'
	ok !data..user..age