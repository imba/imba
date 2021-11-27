let count = 100

export tag Post
	uniq = count++
	<self @pointerup.stop=(data.type = Category)> "POST! {data.title} {uniq} {data.type.name}"

export tag Category
	uniq = count++
	<self @pointerup.stop=(data.type = Post)> "CATEGORY! {data.title} {uniq} {data.type.name}"
	
const items = [
	{type: Post, title: "Welcome!", id: 1}
	{type: Category, title: "Articles", id: 2}
	{type: Category, title: "Articles", id: 3}
]


describe "dynamic type" do
	let nr = 0
	tag App
		<self> <{items[nr].type} data=items[nr]>
	imba.mount(let app = <App>)

	test do
		ok app.children[0] isa Post
		nr = 1
		app.render!
		ok app.children[0] isa Category

describe "dynamic type and key" do
	let nr = 0
	tag App
		<self>
			if typeof nr == 'number'
				<{items[nr].type} data=items[nr] $key=items[nr]>

	imba.mount(let app = <App>)

	test do
		ok app.children[0] isa Post
		nr = 1
		app.render!
		ok app.children[0] isa Category
		items[1].type = Post
		app.render!
		ok app.children[0] isa Post
		items[1].type = Category

describe "dynamic template and key" do
	let nr = 0
	tag App

		def template item
			<{item.type} data=item>

		<self>
			<(template(items[nr])) $key=items[nr]>

	imba.mount(let app = <App>)

	test do
		ok app.children[0] isa Post
		nr = 1
		app.render!
		ok app.children[0] isa Category
		items[1].type = Post
		app.render!
		ok app.children[0] isa Post
		items[1].type = Category

describe "With component" do
	let nr = 0
	let counters = {
		setup: 0
		render: 0
		mount: 0
		visit: 0
	}

	tag Item
		def setup
			counters.setup++

		def render
			counters.render++
			<self> <div> "Hello"


	tag App
		def template item
			<Item data=item>

		<self>
			<(template(items[nr]))>

	test do
		imba.mount(let app = <App>)
		eq counters.render,1
		eq counters.setup,1