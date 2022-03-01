import 'pages/index'
import worker from './worker?as=webworker'

global css html
	ff:sans


console.log "URL to worker",worker.url

global.worker = new Worker(worker.url)

tag app
	<self>
		<div id="dropdown">
		<header>
			<svg[w:200px h:auto] src='assets/logo.svg'>
			<p> "Edit {<code> "app/client.imba"} and save to reload"
			<a#imba.io href="https://imba.io"> "Learn Imba"

		<nav>
			<a route-to="/context"> "/context"
		
		<context-page route="/context">
		<div> "Worker url {worker.url}"
			

imba.mount <app>