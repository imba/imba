import {styles as imba_styles} from 'imba'/*$path$*/;

/*body*/
// import 'pages/index'
// import worker from './worker?as=webworker'
// console.log "URL to worker",worker.url
// global.worker = new Worker(worker.url)






// tag app
// 	<self>
// 		<div id="dropdown">
// 		<header>
// 			<svg[w:200px h:auto] src='assets/logo.svg'>
// 			<p> "Edit {<code> "app/client.imba"} and save to reload"
// 			<a#imba.io href="https://imba.io"> "Learn Imba"
// 
// 		<nav>
// 			<a route-to="/context"> "/context"
// 		
// 		<context-page route="/context">
// 		<div> "Worker url {worker.url}"
// 	
// 	def setup
// 		import('./dynamic').then do
// 			console.log 'loaded client!'
// 
// imba.mount <app>

globalThis.load = function() {
	
	return import('./dynamic').then(function() {
		
		return console.log('loaded client!');
	});
};

imba_styles.register('a7vw7d',`
html {font-family: var(--font-sans,system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");}
`);