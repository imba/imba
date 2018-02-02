# to run these tests, simply open the imbadir/test/dom.html in your browser and
# open the console / developer tools.

extern describe, test, ok, eq, it

describe "Tags - SVG" do

	test "basics" do
		var item = <svg:svg>
			<svg:g>
			<svg:circle r=20>

		Imba.root.appendChild item

		try
			<svg:div>
			eq 1,0
		catch e
			yes

		ok item.dom isa SVGElement
		ok (<svg:circle>).dom isa SVGCircleElement
