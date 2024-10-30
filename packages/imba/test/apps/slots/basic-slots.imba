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

tag func-element

	def stuff cls
		<em.fallback .{cls}> "hello"

	def render
		<self>
			<div> "This is a box"
			<slot>
				<stuff('stuff')>
				<div>

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

			<func-element.five>
			<func-element.six> <div.slotted> "hello"

imba.mount <app-root>

test do
	ok document.querySelector('.one em.slotted')
	ok document.querySelector('.two em.fallback')
	ok document.querySelector('.three .div2')
	ok document.querySelector('.four div')

	ok document.querySelector('.five em.fallback')
	ok document.querySelector('.six div.slotted')
	ok !document.querySelector('.six em.fallback')