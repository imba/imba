tag box-element
	def render
		<self>
			<header> <slot name="header"> <b.empty> "empty header"
			<div> "This is a box"
			<slot> <b.main.empty> "no content inside box"
			<footer>
				<slot name="footer"> <b.empty> "empty footer"
			#	<em> "no content was provided"

tag app-root
	def render
		<self>
			<div> "This is the app"
			<box-element.one>
				<em.main> "custom content only"
			<box-element.two>
			<box-element.three>
				<div.d1> "multiple tags inside box"
				<div.d2> "multiple items inside box"
				<div slot="footer">
					<em> "custum footer"
			<box-element.four>
				<div slot="header">
					<em> "custom header only"

imba.mount <app-root>

test do
	ok document.querySelector('.one div + em.main')
	ok document.querySelector('.three > .d1')
	ok document.querySelector('.three > .d2')