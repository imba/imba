# A dynamic tag whose expression returns an svg element gets the containing
# template's css scope stamped through flags.reconcile, like any other
# dynamic root. svg elements expose className as an SVGAnimatedString, not a
# string, so the reconcile must not assume a string there.

tag app-root
	css .icon w:16px

	def icon
		<svg.icon viewBox="0 0 16 16">
			<circle r="8" cx="8" cy="8">

	def render
		<self>
			<div.wrap> <(icon!)>

let app = <app-root>
imba.mount app

test do
	let svg = app.querySelector('svg')
	ok svg isa SVGSVGElement
	ok svg.getAttribute('class').indexOf('icon') >= 0
	let cls = svg.getAttribute('class')
	app.render!
	eq svg.getAttribute('class'), cls
