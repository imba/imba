var counter = 0

def toggleList
	counter += 3
	Imba.commit()

tag custom-item

def incr
	counter++

tag app-root < component
	
	def render
		<self>
			<div :click.incr> "Count is {counter}"
			<div :click.toggleList> "Toggle?"
			<custom-item> "one"
			<custom-item> "two"

imba.mount( <app-root> )

test "hello" do
	eq 10,10