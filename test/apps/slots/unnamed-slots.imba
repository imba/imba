### css
.header {
	color: red;
}
###
tag box-element
	def render
		<self>
			<h1.header>
				<slot name="header"> 
					<em> "fallback header"
tag app-root
	def render
		<self>
			<box-element.one>
				<div slot="header">
						"hello"        
				<div> "Body Copy"
				<div slot="footer"> "Footer"

imba.mount <app-root>