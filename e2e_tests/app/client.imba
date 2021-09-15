import './pages/index'

global css html
	ff:sans

tag app
	<self>
		<div id="dropdown">
		<header>
			<svg[w:200px h:auto] src='./logo.svg'>
			<p> "Edit {<code> "app/client.imba"} and save to reload"
			<a#imba.io href="https://imba.io"> "Learn Imba"

		<nav>
			<a route-to="/context"> "/context"
		
		<context-page route="/context">
			

imba.mount <app>