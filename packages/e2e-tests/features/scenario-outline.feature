Feature: Scenario outline
	Scenario outline enables running the same test
	on a set of data defined in examples

	Background:
		Given the initial value is 0

	Scenario Outline: Adding two numbers works on many cases

		Given I add <a> and <b>
		Then I should obtain <result>

		Examples: Basic examples
			| a  | b  | result |
			| 1  | 2  | 3      |
			| 12 | 2  | 14     |
			| 13 | 1  | 14     |
			| 14 | 0  | 14     |
			| 15 | -1 | 14     |
			| 16 | -2 | 14     |
			| 17 | -3 | 14     |
			| 18 | -4 | 14     |

	Scenario Outline: Adding two numbers works on many cases
		Given I concatenate <a> and <b>
		Then The "str" in context is <result>

		Examples: Basic examples for concat
			| a | b | result |
			| al  | pha  | alpha  |
			| ab  | dellah  | abdellah  |