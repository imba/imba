
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

tag app-root
	
	def render
		<self>
			<p.scoped> "Scoped"

imba.mount( <app-root> )

var p = document.createElement('p')
p.textContent = "Regular"
document.body.appendChild(p)

var p2 = <p>

test "scoped css" do
	eq 1,1

	await Promise.new(do |resolve| 
		setTimeout(resolve, 10)
	)
	eq 2,2

	var p1 = $(p.scoped)
	var p2 = $(p:not(.scoped))
	eq window.getComputedStyle(p1).fontSize, '16px'
	eq window.getComputedStyle(p2).fontSize, '8px'

test "work with document.createElement" do
	var el = document.createElement('app-root')
	document.body.appendChild(el)
	eq JSON.stringify(el.dataset),JSON.stringify(p2.dataset)

test "work with imba.createComponent" do
	var el = imba.createComponent('app-root')
	eq JSON.stringify(el.dataset),JSON.stringify(p2.dataset)