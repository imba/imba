import {shout} from './lib'

let loud = shout('hello')

tag inferred-app
	<self @click.flag('on')>
		"{loud}"
