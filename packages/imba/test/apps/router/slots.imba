import 'imba/spec'

tag app-head

tag app-body

	<self> <slot>

tag app-home

	<self>
		# <nav>
		# 	<a route-to=""> "Base"
		# 	<a route-to="more"> "More"
		<app-body>
			<div route='more'> "More"


export tag App
	def render
		<self>

			<header[d:hflex]>
				<a$a href="/home"> "Home"
				<a$b href="/about"> "About"
				
			<section$body>
				<app-home route="/home">

let app = imba.mount <App>
let body = app.$body

def go url, text = null
	imba.router.go(url)
	await imba.commit!
	
	if text !== null
		eq body.textContent, text
	

test do
	await go('/home/more')
	eq body.textContent, "More"