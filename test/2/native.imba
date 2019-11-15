document.body.appendChild(<todo-app todos=todos>)

var items = [1,2,3,4,5,6]
var name = "hello"

def test data
	<div>
		<p> data.msg
		<div> for obj,i in data.list
			<div title=data.msg+i>
				<span.{data:msg}> "{obj.text}"
				<span.baz> "one"
				<span.qux> "two"
				<div>
					<span.qux> "three"
					<span.qux> "four"
					<span.baz> "five"
					<div>
						<span.qux> "six"
						<span.baz> "seven"
						<span.{data.msg}> "eight"

def main
	<div tabindex=0>
		<h1 title="test"> "Hello"
		<h2 .{name}> "Subtitle"
		<div>
			@one
			@two
		<div>
			@three
		<div>
			"{@four}"
		# <ul>
		# 	for item,i in items
		# 		<li@{item} data=item>
		# 			<span> "hello {i}"
		<ul>
			for item,i in items
				<li> <span> "indexed {i}"

var el = main()
document.body.appendChild(el)

ADD = do
	items.push(items.length * 10)
	el.render()

REM = do
	items.pop()
	el.render()
