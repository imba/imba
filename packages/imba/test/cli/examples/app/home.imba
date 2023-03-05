
import './shared'

global css @root $home:1 bg:url(assets/code.png)

import sw from './sw.imba?serviceworker'

# import as url?
console.log "serviceworker url",sw


tag home-page

	<self>
		<div[fw:700]> "Hello from about page!"
		<img src="assets/code.png">
		<svg src="svg/logo.svg">

imba.mount <home-page>
