let flip = false
let name = null
let mult = 'm1 m2'

tag custom-element
	def render
		<self.custom-class>
			<input type='checkbox'>
			<input[flip] type='checkbox'>
			<input[name] type='checkbox' value='hello'>
			<input[name]>
			<div.child-class>
				<span> 'child'
			<div.one.two .{name} .{mult} .flipped=flip>

let el = <custom-element>
imba.mount(el)

test 'class added in self' do
	ok el.classList.contains('custom-class')

test 'static class in child' do
	ok $$(div.child-class)

