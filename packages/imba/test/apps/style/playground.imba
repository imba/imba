
tag app-root

	css @not-lg
		l:vflex

	css $sidebar
		background:red

	css p:local
		color:red

	def expand
		$sidebar.open!

	def render
		<self>
			<div$sidebar> "Hello"
			<p> "Hello there"

imba.mount <app-root>

tag app-inherited < app-root

	css p
		font-size: 20px

	def render
		<self> "Hello there"