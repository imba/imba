var items = [1,2,3,4,5,6]
var name = "hello"


tag App
	def render
		<self tabindex=0>
			<h1 title="test"> "Hello"
			<h2 .{name}> "Subtitle"
			<div>
				@one
				@two
			<div>
				@three
			<div>
				"{@four}"
			<ul>
				for item,i in items
					<li@{item} data=item>
						<span> "hello {i}"
			<ul>
				for item,i in items
					<li> <span> "indexed {i}"
		return

var el = <App>

EL = el
Imba.mount(el)

ADD = do
	items.push(items.length * 10)
	EL.render()

REM = do
	items.pop()
	EL.render()
