extern describe, test, ok, eq, it

describe "Syntax - Conditionals" do

	test "unary" do
		var t = yes, f = no
		var obj = {on: (do yes), off: (do no) }

		eq (t ? 10 : 20), 10
		eq (f !== undefined ? !f : undefined), yes
		eq (t ? obj?.on : obj?.off), yes
		# e.event:metaKey ? pane?.show : pane?.maximize