
import {Section} from './section'

export tag App
	def render
		<self>
			<header>
				<h1> "Hello"
			<section>
				<p> "Something"
				<button.button> 'Submit'
			<Section>

Imba.mount(<App>)

### style
p {
	color: blue;
}

.App >>> p { text-decoration: underline; }

###

console.log "welcome"

### style
button {
	background: #ccc;
}
###

### style.less
@a: 20px;
button {
	font-size: @a;
}
###