describe 'Syntax - Return' do

	local class SyntaxReturn

		def none
			return

		def single
			return 1

		def multi
			return 1,2

		def d
			return if true
			return 1

	var obj = SyntaxReturn.new

	test "explicit" do
		eq obj.single, 1
		eq obj.multi, [1,2]
		eq obj.d,undefined

		var fn = do
			return
				1
				2
		eq fn(),[1,2]