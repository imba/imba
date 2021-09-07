
tag Custom
	
	def render
		<self route='/custom'> "custom"
			<div route='deep'> 'deep'

export tag App
	def render
		<self>
			<div> "{document.location.href}"
			# <p> "This is rendered from the server"

			<header[d:hflex]>
				<a$a href="/home"> "Home"
				<a$b href="/about"> "About"
				<a$c href="/custom"> "Custom"
				
			<section$body>

				<div route="/home">
					<div> "home"
					<div route='deep'> 'deep'
					

				<div route="/about">
					<div> "about"
					
				<Custom>
					

let app = imba.mount <App>
let body = app.$body

def go url, text = null
	imba.router.go(url)
	await imba.commit!
	
	if text !== null
		eq body.textContent, text
	

test do
	await go('/')
	eq body.textContent, ""
	await app.$a.click! # spec.click(app.$a)
	await imba.commit!
	eq body.textContent, "home"
	
	await app.$b.click! # spec.click(app.$b)
	await imba.commit!
	eq body.textContent, "about"
	
	await app.$c.click! # spec.click(app.$b)
	await imba.commit!
	eq body.textContent, "custom"
	
	await go('/home/deep',"homedeep")
	await go('/custom/deep',"customdeep")
	# eq body.textContent, "custom"