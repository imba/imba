new class
	@given('I add {int} and {int}')
	def add([a, b])
		result += a + b
	
	@then('I should obtain {int}')
	def checkResult([res])
		ok result, res

	@given('the initial value is {int}')
	def step([initial])
		# Write code here that turns the phrase above into concrete actions
		result = initial