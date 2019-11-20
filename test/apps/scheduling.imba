extern describe, test, ok, eq, it

var counter = 0

def test fn
	fn()

def toggleList
	counter += 3
	Imba.commit()

tag custom-item

tag app-root < component
	def incr
		counter++

	def mount
		schedule()
		console.log "mounted"

	def render
		<self>
			<div :click.incr> "Count is {counter}"
			<div :click.toggleList> "Toggle?"
			<custom-item> "one"
			<custom-item> "two"

Imba.mount(<app-root>)

# 
describe "something" do
	test "basic" do
		eq 10,10