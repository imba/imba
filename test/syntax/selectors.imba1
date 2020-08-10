extern describe, test, ok, eq, it

def check sel, query
	eq(sel.query,query)

describe "Syntax - Selectors" do

	test "variations" do
		var a = 1
		var s = "ok"

		check $(ul li .item), "ul li .item"
		check $(ul custom.hello), "ul ._custom.hello"
		check $(ul > li div[name={s}]), 'ul>li div[name="ok"]'
		check $(ul > li div[tabindex={a}]), 'ul>li div[tabindex="1"]'
		check $(mycanvas,other), '._mycanvas,._other'
