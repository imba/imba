import 'imba/preflight.css'
import './components'

global css body
	m:0 p:0 ff:sans bg:#f6f6ef
	a c:inherit td:none @hover:underline cursor:pointer

tag app-root
	<self>
		<header[bg:#ff6602 h:8 d:hflex ja:center pos:sticky t:0]>
			css a px:1 c.active:white
			<a route-to='/top'> "Top"
			<a route-to='/new'> "New"
			<a route-to='/show'> "Show"
			<a route-to='/ask'> "Ask"
		<main[c:gray5 fs:xs]>
			<story-list route='/:category'>

imba.router.alias('/', '/top')
imba.mount <app-root>