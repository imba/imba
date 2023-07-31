Feature: Nested feature

	Nested feature allows for step definition methods to return feature files
	that will be compiled and executed within the same context.

	Scenario: Runs features
		Given I dynamically add from feature file
		Then I should obtain 212