
tag Custom
	
	def render
		<self route='/custom'> "custom"
			<div route='deep'> 'deep'

export tag App
	def render
		<self>
			<div> "{document.location.href}"

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

				<div route='/'> "/"
					
				<Custom>

				<div route='*'> "404"
					

let app = imba.mount <App>
let body = app.$body

def go url, text = null
	imba.router.go(url)
	await imba.commit!
	
	if text !== null
		eq body.textContent, text


let events = []
let event
let router = imba.router
let history = router.history

router.on('change') do(e)
	events.push(event = e)

test do
	eq router.history.length,1
	let obj = {anim: 'special'}
	router.go('/home',obj)
	eq event.mode,'push'
	eq event.apply.length,1
	eq event.apply[0].data,obj
	eq document.location.pathname,'/home'
	eq history.length,2
	eq history.state.data,obj
	eq history.state.data.anim,'special'

	let action = {action: 'saved'}
	router.go(action)
	eq history.length,3
	eq history.state.data,action
	
	router.go(-2)
	await imba.commit!
	eq history.index,0
	eq event.revert.length,2
	eq event.revert[0].data,action
	eq event.revert[1].data,obj
