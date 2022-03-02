# import 'pages/index'
# import worker from './worker?as=webworker'
# console.log "URL to worker",worker.url
# global.worker = new Worker(worker.url)

# global css html
#	ff:sans
#	$from-client: "from-client"

import '../codicons/codiconStyles'
# import './monaco.css'

# tag app
# 	<self>
# 		<div id="dropdown">
# 		<header>
# 			<svg[w:200px h:auto] src='assets/logo.svg'>
# 			<p> "Edit {<code> "app/client.imba"} and save to reload"
# 			<a#imba.io href="https://imba.io"> "Learn Imba"
# 
# 		<nav>
# 			<a route-to="/context"> "/context"
# 		
# 		<context-page route="/context">
# 		<div> "Worker url {worker.url}"
# 	
# 	def setup
# 		import('./dynamic').then do
# 			console.log 'loaded client!'
# 
# imba.mount <app>

global.load = do
	import('./dynamic').then do
		console.log 'loaded client!'