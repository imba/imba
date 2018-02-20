require './router'

tag Home
	def render
		<self> "Home!!"
		
tag About
	def render
		<self>
			"About {title}"
			<h2> "route param {route:id}"
		
	def mount
		log 'mount about'
	
	def unmount
		log 'unmount about'
		
tag App
	def render
		<self>
			<header>
				<a href='#/'> 'root'
				<a href='#/home'> 'home'
				<a href='#/about'> 'about'
				<a href='#/about/deep'> 'deep'
				<a href='#/about/other'> 'other'
			
			<About route.exact='/' title="root">
			<Home  route='/home'>
			<About route.exact='/about'>
			<About route='/about/:id' title="Other">
			if Math.random > 0.5
				<div> "coinflip"

Imba.mount <App>
