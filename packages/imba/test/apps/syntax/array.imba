describe "Array" do
	
	test "negative literal index" do
		let arr = [1,2,3,4,5,6]
		eq arr[-1], 6
		eq arr[-2], 5
		