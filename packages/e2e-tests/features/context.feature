Feature: Context
	Contexts are "where" tests are executed. They hold the state
	+ any helper methods you want available in step definition
	methods

	# Background: Sets initial value for the sum
	# 	Given the initial value is 10

	Scenario: Accessing a value in context works
		Then The "version" in context is "2"
	