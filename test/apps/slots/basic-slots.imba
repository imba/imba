### css
box-element {
	border: 1px solid black;
	padding: 10px;
	margin: 10px;
	display: block;
}
###

tag basic-element


tag box-element

	def render
		<self>
			<div> "This is a box"
			<slot>
				<em.fallback> "no content was provided"

tag app-root
	def render
		<self>
			<div> "This is the app"
			<box-element.one>
				<em.slotted> "content inside box"
			<box-element.two>
			<box-element.three>
				<div.div1> "multiple tags inside box"
				<div.div2> "multiple items inside box"
			<basic-element.four>
				<div> "div inside basic element"

imba.mount <app-root>

test do
	ok $(.one em.slotted)
	ok $(.one em.slotted)
	ok $(.two em.fallback)
	ok $(.three .div2)
	ok $(.four div)