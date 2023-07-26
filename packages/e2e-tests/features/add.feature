Feature: Addition
	Addition is a major building block of Maths

	Background: Sets initial value for the sum
		Given the initial value is 10

	Scenario: Adding two numbers works with background

		Given I add 12 and 4
		Then I should obtain 26
	
	Scenario: Supports multiple scenarios

		Given I add 12 and 10
		Then I should obtain 32
