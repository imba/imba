describe 'Syntax - Delete' do

	test "should return value" do
		var obj = {name: "John", age: 20}
		var age = delete obj:age
		eq age, 20
		eq obj:age, undefined