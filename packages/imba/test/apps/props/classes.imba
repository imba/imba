let flip = false
let name = null
let mult = 'm1 m2'

tag with-local-flags
	def setup
		flags.add('local')

tag nested-element

	def render
		<self.inner .innerflip=flip>
			<div.d1> "Div"
			<slot>

tag static-inside

	def render
		<self.inner>
			"Static inside"

tag custom-element
	def render
		<self.custom-class>
			<input bind=flip type='checkbox'>
			<input bind=name type='checkbox' value='hello'>
			<input bind=name>
			<div.child-class>
				<span> 'child'
			<div.one.two .{name} .{mult} .flipped=flip>
			<nested-element.outer .outerflip=flip>
			<nested-element.static-outer>
			<static-inside.outer>
			<with-local-flags.outer> "With local"

let el = <custom-element>
imba.mount(el)

test 'class added in self' do
	ok el.classList.contains('custom-class')

test 'static class in child' do
	ok document.querySelector('div.child-class')

test 'multiple dynamic' do
	ok document.querySelector('div.one.m1.m2')
	mult = ''
	await spec.tick()
	ok document.querySelector('div.one:not(.m2)')

test 'combined outer and inner flags' do
	ok document.querySelector('nested-element.outer.inner')
	ok document.querySelector('static-inside.outer.inner')

test 'combined outer and inner flags' do
	flip = true
	await spec.tick()
	ok document.querySelector('nested-element.outerflip.innerflip')

test 'static outer and inner flags' do
	ok document.querySelector('nested-element.static-outer.inner')

test do
	ok document.querySelector('with-local-flags.outer.local')