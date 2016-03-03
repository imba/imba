extern describe, test, ok, eq, it

class ThrowClass

	prop cleanup
	
	def returnBeforeFinally num
		try
			10
			num * 2
		finally
			10
			cleanup = true
		
		

describe 'Syntax - Catch' do

	test "throw catch" do

		var res = false
		var after = false

		try nometh * 10 catch e res = 1
		ok res

		# also works with statements
		res = try nometh catch e 2
		eq res, 2

		# finally is executed after the result of
		# expression is evaluated
		res = try nometh catch e 2 finally after = 3

		eq res, 2
		eq after, 3

		# check that throw works as expected
		res = try 
			2
			throw 10
		catch e
			e + 10

		eq res, 20

		# try works alone - adds automatic catch
		res = try 10
		eq res, 10

		var obj = ThrowClass.new
		eq obj.returnBeforeFinally(2), 4
		eq obj.cleanup, true
		


		

