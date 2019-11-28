### css
box-element {
	border: 1px solid black;
	padding: 10px;
	margin: 10px;
	display: block;
}
###


tag box-element
	def render
		<self>
			<slot name="header"> <b.empty> "empty header"
			<div> "This is a box"
			<slot> <b> "no content inside box"
			<footer>
				<div> "Custom footer content:"
				<slot name="footer"> <b.empty> "empty footer"
			#	<em> "no content was provided"

tag app-root
	def render
		<self>
			<div> "This is the app"
			<box-element.one>
				<em> "content inside box"
			<box-element.two>
			<box-element.three>
				<div> "multiple tags inside box"
				<div> "multiple items inside box"
				<div slot="footer">
					<em> "Stuff inside footer here!"

imba.mount <app-root>