let color = "blue"

tag app-root
	def render
		<self>
			<div[c:{color}]>
			<svg[fill:{color}]>

imba.mount <app-root>