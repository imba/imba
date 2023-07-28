@debug
@makeVersion10
Feature: Context
	Tags (for us at least) are basically decorators ... So powerful
	e.g:
		disable headless mode and increase test timeout
		Run tests in a different context
		Run only a subset of tests

	Scenario: Accessing a value in context works
		Then The "version" in context is "10"
	