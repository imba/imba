Feature: Nested feature

	Nested feature allows for step definition methods to return feature files
	that will be compiled and executed within the same context.

	@fails
	Scenario: Fails when a nested feature step fails
		Given I run a failing feature file

	Scenario: Runs features
		Given I dynamically add from feature file
		Then I should obtain 212