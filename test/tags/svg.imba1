# to run these tests, simply open the imbadir/test/dom.html in your browser and
# open the console / developer tools.

extern describe, test, ok, eq, it

describe "Tags - SVG" do
	
	
	if $web$
		test "basics" do
			var item = <svg:svg>
				<svg:g>
				<svg:circle r=20>

			Imba.root.appendChild item
			ok item.dom isa SVGElement
			ok (<svg:circle>).dom isa SVGCircleElement
			
		test "native types" do
			eq (<svg:animateMotion>).dom:constructor, SVGAnimateMotionElement
			ok (<svg:circle>).dom isa SVGCircleElement
			ok (<svg:someCustomElement>).dom isa SVGElement
		
		