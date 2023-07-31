new class
	@given('I add {int} and {int}')
	def add([a, b])
		result += a + b
		

	@given('I run a failing feature file')
	def fail
		const feature = """
		Feature: Failure
			Background: Init
				Given the initial value is 0
			Scenario: Fail now
				Given I add 1 and 4
				Then I should obtain 2
				Given I add 1 and 4
				Then I should obtain 5
		"""
		{__features: [feature]}

	@given('I dynamically add from feature file')
	def dynamic-add
		const feature = """
		Feature: Dynamic addition
			Background: Init
				Given the initial value is 0

			Scenario: Add dynamically
				Given I add 1 and 3
			
			Scenario Outline: Adding two numbers works on many cases

				Given I add <a> and <b>
				Then I should obtain <result>

				Examples: Basic examples
					| a  | b    | result  |
					| 10 | 2    | 12      |
					| 12 | 200  | 212     |
		"""
		{__features: [feature]}

	@then('I should obtain {int}')
	def checkResult([res])
		ok result, res

	@given('the initial value is {int}')
	def step([initial])
		# Write code here that turns the phrase above into concrete actions
		result = initial
	