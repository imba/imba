
### css
p {
	font-size: 8px;
}
###

### css scoped
p {
	font-size: 16px;
}
###

tag app-root < component
	
	def render
		<self>
			<p.scoped> "Scoped"

document.body.appendChild( <app-root> )

var p = document.createElement('p')
p.textContent = "Regular"
document.body.appendChild(p)

test "scoped css" do
	eq 1,1

	await Promise.new(do |resolve| 
		setTimeout(resolve, 10)
	)
	eq 2,2

	var p1 = document.querySelector('p.scoped')
	var p2 = document.querySelector('p:not(.scoped)')
	eq window.getComputedStyle(p1).fontSize, '16px'
	eq window.getComputedStyle(p2).fontSize, '8px'