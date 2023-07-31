new class
	@given('I concatenate {string} and {string}')
	def concat([a, b])
		str = a + b
	
	@then('The {string} in context is {string}')
	def step2([variable, value])
		ok self[variable], value