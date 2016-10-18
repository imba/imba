extern describe, test, ok, eq, it

describe "Syntax - Conditionals" do

	test "unary" do
		var t = yes, f = no
		var obj = {on: (do yes), off: (do no) }

		eq (t ? 10 : 20), 10
		eq (f !== undefined ? !f : undefined), yes
		eq (t ? obj?.on : obj?.off), yes

		eq (t ? '.' + f : ''), '.false'
		# e.event:metaKey ? pane?.show : pane?.maximize
		
	test "unary precedence" do
		var m
		var a = null
		var b = 2
		var res
		var block = do yes
		
		block
			if m = a
				res = 1
			elif m = b
				res = m
			else
				null
		
		eq res,2