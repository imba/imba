tag app-root

	def resized e
		console.log 'resized',e.contentRect

	def render
		<self.block>
			<div.relative.bg-blue-200.p-4.inline-block @resize=resized>
				<textarea.resize>

imba.mount <app-root>


### css

.resizable {
	border: 1px solid blue;
	padding: 10px;
	width: 200px;
	height: 100px;
}
.expanded {
	width: 400px;
}
