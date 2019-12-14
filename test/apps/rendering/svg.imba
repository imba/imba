var a = `te"st'{10}`
var b = "test'{10}"

tag app-root
	def render
		<self>
			<svg.pie viewBox="0 0 64 64" data-test=10>
				<circle r="25%" cx="50%" cy="50%">

imba.mount <app-root>