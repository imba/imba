
describe 'Syntax - Switch' do

	test "general" do
		var type = 1
		var value = switch type
			when 1
				'A'
			else
				'B'
		eq value, 'A'
		
		# compact
		var value = switch type
			when 1 then 'A'
			else 'B'
		eq value, 'A'