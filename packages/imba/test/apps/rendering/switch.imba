let num = 0
tag app-switch
	def render
		<self>
			switch num
				when 0
					<a>
				when 1
					<b>
				when 2
					<i>
					<s>
				else
					<p>

let app = <app-switch>
imba.mount(app)

test do
	num = 0
	app.render()
	ok app.querySelector('a:only-child')

test do
	num = 1
	app.render()
	ok app.querySelector('b:only-child')


test do
	num = 2
	app.render()
	ok app.querySelector('i:first-child + s:last-child')

test do
	num = 3
	app.render()
	ok app.querySelector('p:only-child')